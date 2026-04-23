import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Flag } from "lucide-react";
import { LiveBackground } from "@/components/LiveBackground";
import { FullscreenButton } from "@/components/FullscreenButton";
import { recordPartial } from "@/lib/studyTracker";

const pad = (n: number, w = 2) => Math.floor(n).toString().padStart(w, "0");

const format = (ms: number) => {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return { h, m, s, cs };
};

const Stopwatch = () => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef(0);
  const accRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      startRef.current = performance.now();
      const tick = () => {
        setElapsed(accRef.current + (performance.now() - startRef.current));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      accRef.current = elapsed;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const reset = () => {
    setRunning(false);
    accRef.current = 0;
    setElapsed(0);
    setLaps([]);
  };

  const lap = () => {
    if (running) setLaps((l) => [elapsed, ...l]);
  };

  const { h, m, s, cs } = format(elapsed);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <LiveBackground variant="ocean" />

      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4">
        <Link to="/" className="glass rounded-full p-2.5 text-white hover:scale-110 transition-transform">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-display text-white text-lg font-semibold tracking-wide">stopwatch</h1>
        <FullscreenButton />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 gap-10">
        <div className="font-display font-bold text-white tabular-nums text-5xl sm:text-7xl md:text-8xl tracking-tight text-center"
          style={{ textShadow: "0 2px 30px rgba(0,0,0,0.4)" }}>
          {h > 0 && <span>{pad(h)}:</span>}
          {pad(m)}:{pad(s)}
          <span className="text-3xl sm:text-5xl opacity-70">.{pad(cs)}</span>
        </div>

        <div className="flex items-center gap-3">
          {!running ? (
            <button
              onClick={() => setRunning(true)}
              className="glass rounded-full px-7 py-3 text-white font-display font-medium flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Play className="w-4 h-4" /> Start
            </button>
          ) : (
            <button
              onClick={() => setRunning(false)}
              className="glass rounded-full px-7 py-3 text-white font-display font-medium flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
          )}
          <button
            onClick={lap}
            disabled={!running}
            className="glass rounded-full p-3 text-white hover:scale-110 transition-transform disabled:opacity-40 disabled:hover:scale-100"
            title="Lap"
          >
            <Flag className="w-4 h-4" />
          </button>
          <button
            onClick={reset}
            className="glass rounded-full p-3 text-white hover:scale-110 transition-transform"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {laps.length > 0 && (
          <div className="glass rounded-2xl p-4 w-full max-w-sm max-h-64 overflow-y-auto">
            <h3 className="font-display text-white/80 text-xs uppercase tracking-widest mb-2">Laps</h3>
            <ul className="space-y-1.5">
              {laps.map((l, i) => {
                const f = format(l);
                return (
                  <li key={i} className="flex justify-between text-white font-body text-sm tabular-nums">
                    <span className="text-white/60">Lap {laps.length - i}</span>
                    <span>
                      {f.h > 0 && `${pad(f.h)}:`}
                      {pad(f.m)}:{pad(f.s)}.{pad(f.cs)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stopwatch;
