import { DOMAIN_SCHEMA_VERSION } from '@zeldasys/domain';
import { GEOMETRY_PACKAGE_READY } from '@zeldasys/geometry';
import { PHYSICS_PACKAGE_READY } from '@zeldasys/physics';
import { useEffect, useRef, useState } from 'react';

import { ThreeViewport } from '../runtime/ThreeViewport';
import { PocAPanel } from './PocAPanel';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState<ThreeViewport | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const viewport = new ThreeViewport(canvas);
    setViewport(viewport);
    const resizeObserver = new ResizeObserver(() => viewport.resize());

    resizeObserver.observe(canvas);
    viewport.start();

    return () => {
      setViewport(null);
      resizeObserver.disconnect();
      viewport.dispose();
    };
  }, []);

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <strong>ZeldaSys</strong>
          <span className="subtitle">Phase 1 · PoC-A physics baseline</span>
        </div>
        <div className="status-row" aria-label="runtime package status">
          <span>Domain v{DOMAIN_SCHEMA_VERSION}</span>
          <span>Geometry {GEOMETRY_PACKAGE_READY ? 'ready' : 'offline'}</span>
          <span>Physics {PHYSICS_PACKAGE_READY ? 'ready' : 'offline'}</span>
        </div>
      </header>
      <section className="viewport-panel" aria-label="3D build viewport">
        <canvas ref={canvasRef} className="viewport-canvas" />
        <PocAPanel viewport={viewport} />
        <div className="viewport-hint">
          Three.js runtime is isolated from React UI state.
        </div>
      </section>
    </main>
  );
}
