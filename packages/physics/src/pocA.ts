import type {
  RigidBody,
  RevoluteImpulseJoint,
  World,
} from '@dimforge/rapier3d-compat';

export const POC_A_BODY_COUNT = 50;
export const POC_A_FIXED_JOINT_COUNT = 30;
export const POC_A_REVOLUTE_JOINT_COUNT = 4;
export const POC_A_MOTOR_COUNT = 2;
export const POC_A_FAN_COUNT = 2;

type RapierModule = typeof import('@dimforge/rapier3d-compat')['default'];

let rapierModulePromise: Promise<RapierModule> | null = null;

const IDENTITY_ROTATION = { w: 1, x: 0, y: 0, z: 0 } as const;
const HALF_SPACING_X = 0.525;

interface LocalAnchor {
  x: number;
  y: number;
  z: number;
}

interface JointProbe {
  bodyA: RigidBody;
  bodyB: RigidBody;
  localAnchorA: LocalAnchor;
  localAnchorB: LocalAnchor;
}

export interface PocAPhysicsScene {
  world: World;
  bodies: readonly RigidBody[];
  fanBodies: readonly RigidBody[];
  jointProbes: readonly JointProbe[];
  revoluteJoints: readonly RevoluteImpulseJoint[];
}

export interface PocABenchmarkOptions {
  warmupSteps?: number;
  measuredSteps?: number;
}

export interface PocABenchmarkResult {
  bodyCount: number;
  fixedJointCount: number;
  revoluteJointCount: number;
  motorCount: number;
  fanCount: number;
  timestepSeconds: number;
  warmupSteps: number;
  measuredSteps: number;
  averageStepMs: number;
  p95StepMs: number;
  maxStepMs: number;
  maxAnchorDrift: number;
  nonFiniteBodyCount: number;
}

async function getRapier(): Promise<RapierModule> {
  rapierModulePromise ??= import('@dimforge/rapier3d-compat').then(
    async ({ default: RAPIER }) => {
      await RAPIER.init();
      return RAPIER;
    },
  );

  return rapierModulePromise;
}

export async function createPocAPhysicsScene(): Promise<PocAPhysicsScene> {
  const RAPIER = await getRapier();
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  world.timestep = 1 / 60;

  world.createCollider(
    RAPIER.ColliderDesc.cuboid(20, 0.25, 20)
      .setTranslation(0, -0.25, 0)
      .setFriction(0.9),
  );

  const bodies: RigidBody[] = [];

  for (let index = 0; index < POC_A_BODY_COUNT; index += 1) {
    const row = Math.floor(index / 10);
    const column = index % 10;
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation((column - 4.5) * 1.05, 2 + row * 1.2, (row - 2) * 1.6)
        .setLinearDamping(0.05)
        .setAngularDamping(0.1),
    );

    world.createCollider(
      RAPIER.ColliderDesc.cuboid(0.45, 0.25, 0.35)
        .setDensity(1)
        .setFriction(0.8),
      body,
    );
    bodies.push(body);
  }

  const jointProbes: JointProbe[] = [];
  let fixedJointCount = 0;

  const connectFixed = (bodyAIndex: number, bodyBIndex: number) => {
    const bodyA = bodies[bodyAIndex];
    const bodyB = bodies[bodyBIndex];
    if (!bodyA || !bodyB) {
      throw new Error('PoC-A fixed joint references a missing rigid body');
    }

    const localAnchorA = { x: HALF_SPACING_X, y: 0, z: 0 };
    const localAnchorB = { x: -HALF_SPACING_X, y: 0, z: 0 };
    const params = RAPIER.JointData.fixed(
      localAnchorA,
      IDENTITY_ROTATION,
      localAnchorB,
      IDENTITY_ROTATION,
    );
    const joint = world.createImpulseJoint(params, bodyA, bodyB, true);
    joint.setContactsEnabled(false);
    jointProbes.push({ bodyA, bodyB, localAnchorA, localAnchorB });
    fixedJointCount += 1;
  };

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 9; column += 1) {
      connectFixed(row * 10 + column, row * 10 + column + 1);
    }
  }
  for (let column = 0; column < 3; column += 1) {
    connectFixed(30 + column, 31 + column);
  }

  if (fixedJointCount !== POC_A_FIXED_JOINT_COUNT) {
    throw new Error(`Unexpected PoC-A fixed joint count: ${fixedJointCount}`);
  }

  const revolutePairs = [
    [40, 41],
    [42, 43],
    [44, 45],
    [46, 47],
  ] as const;
  const revoluteJoints: RevoluteImpulseJoint[] = [];

  revolutePairs.forEach(([bodyAIndex, bodyBIndex], jointIndex) => {
    const bodyA = bodies[bodyAIndex];
    const bodyB = bodies[bodyBIndex];
    if (!bodyA || !bodyB) {
      throw new Error('PoC-A revolute joint references a missing rigid body');
    }

    const localAnchorA = { x: HALF_SPACING_X, y: 0, z: 0 };
    const localAnchorB = { x: -HALF_SPACING_X, y: 0, z: 0 };
    const params = RAPIER.JointData.revolute(localAnchorA, localAnchorB, {
      x: 0,
      y: 0,
      z: 1,
    });
    const joint = world.createImpulseJoint(
      params,
      bodyA,
      bodyB,
      true,
    ) as RevoluteImpulseJoint;
    joint.setContactsEnabled(false);

    if (jointIndex < POC_A_MOTOR_COUNT) {
      joint.configureMotorVelocity(jointIndex === 0 ? 6 : -5, 0.8);
      joint.setMotorMaxForce(20);
    }

    revoluteJoints.push(joint);
    jointProbes.push({ bodyA, bodyB, localAnchorA, localAnchorB });
  });

  const fanBodies = [bodies[48], bodies[49]].filter(
    (body): body is RigidBody => body !== undefined,
  );
  if (fanBodies.length !== POC_A_FAN_COUNT) {
    throw new Error('PoC-A fan bodies were not created');
  }

  return {
    world,
    bodies,
    fanBodies,
    jointProbes,
    revoluteJoints,
  };
}

export function stepPocAPhysicsScene(scene: PocAPhysicsScene): void {
  scene.fanBodies.forEach((body, index) => {
    body.resetForces(true);
    body.addForce(
      {
        x: index === 0 ? 4 : -4,
        y: 0.5,
        z: index === 0 ? 1 : -1,
      },
      true,
    );
  });

  scene.world.step();
}

export async function runPocABenchmark(
  options: PocABenchmarkOptions = {},
): Promise<PocABenchmarkResult> {
  const warmupSteps = options.warmupSteps ?? 120;
  const measuredSteps = options.measuredSteps ?? 600;
  const scene = await createPocAPhysicsScene();

  try {
    for (let index = 0; index < warmupSteps; index += 1) {
      stepPocAPhysicsScene(scene);
    }

    const durations: number[] = [];
    for (let index = 0; index < measuredSteps; index += 1) {
      const startedAt = performance.now();
      stepPocAPhysicsScene(scene);
      durations.push(performance.now() - startedAt);
    }

    const sorted = [...durations].sort((left, right) => left - right);
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    const p95Index = Math.min(
      sorted.length - 1,
      Math.floor(sorted.length * 0.95),
    );

    return {
      bodyCount: scene.bodies.length,
      fixedJointCount: POC_A_FIXED_JOINT_COUNT,
      revoluteJointCount: scene.revoluteJoints.length,
      motorCount: POC_A_MOTOR_COUNT,
      fanCount: scene.fanBodies.length,
      timestepSeconds: scene.world.timestep,
      warmupSteps,
      measuredSteps,
      averageStepMs: total / Math.max(durations.length, 1),
      p95StepMs: sorted[p95Index] ?? 0,
      maxStepMs: sorted.at(-1) ?? 0,
      maxAnchorDrift: measureMaxAnchorDrift(scene.jointProbes),
      nonFiniteBodyCount: countNonFiniteBodies(scene.bodies),
    };
  } finally {
    scene.world.free();
  }
}

function countNonFiniteBodies(bodies: readonly RigidBody[]): number {
  return bodies.filter((body) => {
    const translation = body.translation();
    const rotation = body.rotation();
    return ![
      translation.x,
      translation.y,
      translation.z,
      rotation.w,
      rotation.x,
      rotation.y,
      rotation.z,
    ].every(Number.isFinite);
  }).length;
}

function measureMaxAnchorDrift(jointProbes: readonly JointProbe[]): number {
  let maxDrift = 0;

  for (const probe of jointProbes) {
    const anchorA = localPointToWorld(probe.bodyA, probe.localAnchorA);
    const anchorB = localPointToWorld(probe.bodyB, probe.localAnchorB);
    const dx = anchorA.x - anchorB.x;
    const dy = anchorA.y - anchorB.y;
    const dz = anchorA.z - anchorB.z;
    maxDrift = Math.max(maxDrift, Math.hypot(dx, dy, dz));
  }

  return maxDrift;
}

function localPointToWorld(body: RigidBody, point: LocalAnchor): LocalAnchor {
  const translation = body.translation();
  const rotation = body.rotation();
  const rotated = rotateVectorByQuaternion(point, rotation);

  return {
    x: translation.x + rotated.x,
    y: translation.y + rotated.y,
    z: translation.z + rotated.z,
  };
}

function rotateVectorByQuaternion(
  vector: LocalAnchor,
  quaternion: { w: number; x: number; y: number; z: number },
): LocalAnchor {
  const { x, y, z } = vector;
  const { w: qw, x: qx, y: qy, z: qz } = quaternion;

  const ix = qw * x + qy * z - qz * y;
  const iy = qw * y + qz * x - qx * z;
  const iz = qw * z + qx * y - qy * x;
  const iw = -qx * x - qy * y - qz * z;

  return {
    x: ix * qw + iw * -qx + iy * -qz - iz * -qy,
    y: iy * qw + iw * -qy + iz * -qx - ix * -qz,
    z: iz * qw + iw * -qz + ix * -qy - iy * -qx,
  };
}
