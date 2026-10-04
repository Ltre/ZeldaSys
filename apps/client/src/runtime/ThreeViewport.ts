import * as THREE from 'three';
import {
  runPocABenchmark as runPhysicsPocABenchmark,
  type PocABenchmarkOptions,
  type PocABenchmarkResult,
  type PocAPhysicsScene,
} from '@zeldasys/physics';

export interface PocAViewportBenchmarkResult extends PocABenchmarkResult {
  renderFps: number;
}

export class ThreeViewport {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
  private readonly previewMesh: THREE.Mesh;
  private readonly pocABodyTransform = new THREE.Object3D();
  private renderedFrameCount = 0;
  private pocABodyMesh: THREE.InstancedMesh | null = null;
  private pocABodyGeometry: THREE.BoxGeometry | null = null;
  private pocABodyMaterial: THREE.MeshStandardMaterial | null = null;
  private pocAGround: THREE.Mesh | null = null;

  public constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene.background = new THREE.Color(0x0f172a);
    this.camera.position.set(4.5, 3.5, 6.5);
    this.camera.lookAt(0, 0.5, 0);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 2.2);
    this.scene.add(hemisphereLight);

    const grid = new THREE.GridHelper(12, 24, 0x64748b, 0x334155);
    this.scene.add(grid);

    this.previewMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.72 }),
    );
    this.previewMesh.position.y = 0.5;
    this.scene.add(this.previewMesh);

    this.resize();
  }

  public start(): void {
    this.renderer.setAnimationLoop(() => {
      this.renderedFrameCount += 1;
      this.previewMesh.rotation.y += 0.003;
      this.renderer.render(this.scene, this.camera);
    });
  }

  public async runPocABenchmark(
    options: Pick<PocABenchmarkOptions, 'warmupSteps' | 'measuredSteps'> = {},
  ): Promise<PocAViewportBenchmarkResult> {
    let renderedFrameCountAtMeasurementStart = this.renderedFrameCount;
    const result = await runPhysicsPocABenchmark({
      ...options,
      yieldBetweenMeasuredSteps: true,
      onSceneCreated: (scene) => this.mountPocAScene(scene),
      onMeasurementStart: () => {
        renderedFrameCountAtMeasurementStart = this.renderedFrameCount;
      },
      onMeasuredStep: (scene) => this.updatePocAScene(scene),
    });
    const renderedFrames =
      this.renderedFrameCount - renderedFrameCountAtMeasurementStart;

    return {
      ...result,
      renderFps:
        result.measuredWallTimeMs > 0
          ? (renderedFrames * 1000) / result.measuredWallTimeMs
          : 0,
    };
  }

  public resize(): void {
    const width = Math.max(this.canvas.clientWidth, 1);
    const height = Math.max(this.canvas.clientHeight, 1);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  public dispose(): void {
    this.renderer.setAnimationLoop(null);
    this.clearPocAScene();
    this.previewMesh.geometry.dispose();

    const material = this.previewMesh.material;
    if (Array.isArray(material)) {
      material.forEach((entry) => entry.dispose());
    } else {
      material.dispose();
    }

    this.renderer.dispose();
  }

  private mountPocAScene(scene: PocAPhysicsScene): void {
    this.clearPocAScene();
    this.previewMesh.visible = false;
    this.pocABodyGeometry = new THREE.BoxGeometry(0.9, 0.5, 0.7);
    this.pocABodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.72,
    });
    this.pocABodyMesh = new THREE.InstancedMesh(
      this.pocABodyGeometry,
      this.pocABodyMaterial,
      scene.bodies.length,
    );
    this.pocABodyMesh.frustumCulled = false;
    this.scene.add(this.pocABodyMesh);
    this.pocAGround = new THREE.Mesh(
      new THREE.BoxGeometry(40, 0.5, 40),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 }),
    );
    this.pocAGround.position.y = -0.25;
    this.scene.add(this.pocAGround);
    this.updatePocAScene(scene);
  }

  private updatePocAScene(scene: PocAPhysicsScene): void {
    const mesh = this.pocABodyMesh;
    if (!mesh) {
      return;
    }

    scene.bodies.forEach((body, index) => {
      const translation = body.translation();
      const rotation = body.rotation();
      this.pocABodyTransform.position.set(
        translation.x,
        translation.y,
        translation.z,
      );
      this.pocABodyTransform.quaternion.set(
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w,
      );
      this.pocABodyTransform.updateMatrix();
      mesh.setMatrixAt(index, this.pocABodyTransform.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }

  private clearPocAScene(): void {
    if (this.pocABodyMesh) {
      this.scene.remove(this.pocABodyMesh);
      this.pocABodyMesh = null;
    }
    this.pocABodyGeometry?.dispose();
    this.pocABodyGeometry = null;
    this.pocABodyMaterial?.dispose();
    this.pocABodyMaterial = null;

    if (this.pocAGround) {
      this.scene.remove(this.pocAGround);
      this.pocAGround.geometry.dispose();
      const material = this.pocAGround.material;
      if (Array.isArray(material)) {
        material.forEach((entry) => entry.dispose());
      } else {
        material.dispose();
      }
      this.pocAGround = null;
    }

    this.previewMesh.visible = true;
  }
}
