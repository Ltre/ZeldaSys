import { useState } from 'react';

import type {
  PocAViewportBenchmarkResult,
  ThreeViewport,
} from '../runtime/ThreeViewport';

export function PocAPanel({ viewport }: { viewport: ThreeViewport | null }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PocAViewportBenchmarkResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const runBenchmark = async () => {
    setRunning(true);
    setError(null);

    try {
      if (!viewport) {
        throw new Error('3D viewport is not ready');
      }

      setResult(
        await viewport.runPocABenchmark({
          warmupSteps: 120,
          measuredSteps: 600,
        }),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setRunning(false);
    }
  };

  return (
    <aside className="poc-panel" aria-label="PoC-A physics benchmark">
      <div>
        <strong>PoC-A · Rapier baseline</strong>
        <span>50 bodies · 30 fixed · 4 revolute · 2 motors · 2 fans</span>
      </div>
      <button
        type="button"
        disabled={running || !viewport}
        onClick={() => void runBenchmark()}
      >
        {running ? 'Running…' : 'Run benchmark'}
      </button>
      {result ? (
        <>
          <output>
            avg {result.averageStepMs.toFixed(3)} ms · p95{' '}
            {result.p95StepMs.toFixed(3)} ms · max {result.maxStepMs.toFixed(3)}{' '}
            ms · FPS {result.renderFps.toFixed(1)} · drift{' '}
            {result.maxAnchorDrift.toFixed(4)}
          </output>
          <output>
            final active pairs {result.activeContactPairCount} · collision
            starts {result.collisionStartEventCount} · deepest final penetration{' '}
            {result.maxFinalContactPenetration.toFixed(4)} m
          </output>
          <output>invalid bodies {result.nonFiniteBodyCount}</output>
        </>
      ) : null}
      {error ? <output className="poc-error">{error}</output> : null}
    </aside>
  );
}
