import { describe, expect, it } from 'vitest';

import {
  POC_A_BODY_COUNT,
  POC_A_FAN_COUNT,
  POC_A_FIXED_JOINT_COUNT,
  POC_A_MOTOR_COUNT,
  POC_A_REVOLUTE_JOINT_COUNT,
  runPocABenchmark,
} from './pocA';

describe('PoC-A physics benchmark', () => {
  it('keeps the target 50-body joint scene finite and connected', async () => {
    const result = await runPocABenchmark({
      warmupSteps: 30,
      measuredSteps: 120,
    });

    expect(result.bodyCount).toBe(POC_A_BODY_COUNT);
    expect(result.fixedJointCount).toBe(POC_A_FIXED_JOINT_COUNT);
    expect(result.revoluteJointCount).toBe(POC_A_REVOLUTE_JOINT_COUNT);
    expect(result.motorCount).toBe(POC_A_MOTOR_COUNT);
    expect(result.fanCount).toBe(POC_A_FAN_COUNT);
    expect(result.timestepSeconds).toBeCloseTo(1 / 60, 8);
    expect(result.nonFiniteBodyCount).toBe(0);
    expect(result.maxAnchorDrift).toBeLessThan(0.25);
    expect(result.averageStepMs).toBeGreaterThanOrEqual(0);
    expect(result.maxStepMs).toBeGreaterThanOrEqual(result.averageStepMs);
  }, 15_000);
});
