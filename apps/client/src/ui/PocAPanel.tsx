import {
  runPocABenchmark,
  type PocABenchmarkResult,
} from '@zeldasys/physics';
import { useState } from 'react';

export function PocAPanel() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PocABenchmarkResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runBenchmark = async () => {
    setRunning(true);
    setError(null);

    try {
      setResult(
        await runPocABenchmark({
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
      <button type="button" disabled={running} onClick={() => void runBenchmark()}>
        {running ? 'Running…' : 'Run benchmark'}
      </button>
      {result ? (
        <output>
          avg {result.averageStepMs.toFixed(3)} ms · p95{' '}
          {result.p95StepMs.toFixed(3)} ms · max {result.maxStepMs.toFixed(3)} ms ·
          drift {result.maxAnchorDrift.toFixed(4)}
        </output>
      ) : null}
      {error ? <output className="poc-error">{error}</output> : null}
    </aside>
  );
}
