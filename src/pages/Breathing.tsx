import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { LiveBackground } from "@/components/LiveBackground";

// 4-7-8 style box breathing: inhale / hold / exhale / hold
const PHASES = [
  { label: "Inhale", secs: 4, scale: 1.25 },
  { label: "Hold", secs: 4, scale: 1.25 },
  { label: "Exhale", secs: 6, scale: 0.85 },
  { label: "Hold", secs: 2, scale: 0.85 },
];

const Breathing = () => {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secLeft, setSecLeft] = useState(PHASES[0].secs);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecLeft((s) => {
        if (s <= 1) {
          setPhaseIdx((p) => {
            const next = (p + 1) % PHASES.length;
            if (next === 0) setCycles((c) => c + 1);
            return next;
          });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    setSecLeft(PHASES[phaseIdx].secs);
  }, [phaseIdx]);

  const reset = () => {
    setRunning(false);
    setPhaseIdx(0);
    setSecLeft(PHASES[0].secs);
    setCycles(0);
  };

  const phase = PHASES[phaseIdx];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <LiveBackground variant="ocean" />

      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-5 py-4">
        <Link to="/" className="glass rounded-full p-2.5 text-white hover:scale-110 transition-transform">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-display text-white text-lg font-semibold tracking-wide">breathe</h1>
        <div className="w-9" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 gap-8 pt-20 pb-10">
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ scale: running ? phase.scale : 1 }}
            transition={{ duration: phase.secs, ease: "easeInOut" }}
            className="w-60 h-60 sm:w-80 sm:h-80 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.35), rgba(255,255,255,0.05))",
              boxShadow: "0 0 80px rgba(255,255,255,0.2)",
            }}
          />
          <div className="absolute flex flex-col items-center text-white">
            <p className="font-body text-xs uppercase tracking-[0.3em] opacity-80">{phase.label}</p>
            <p className="font-display font-light text-6xl sm:text-7xl tabular-nums mt-2"
              style={{ letterSpacing: "-0.03em" }}>
              {secLeft}
            </p>
          </div>
        </div>

        <p className="text-white/70 text-sm font-body">
          Cycles completed: <span className="text-white font-medium">{cycles}</span>
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className="glass rounded-full px-7 py-3 text-white font-display font-medium flex items-center gap-2 hover:scale-105 transition-transform"
          >
            {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Begin</>}
          </button>
          <button
            onClick={reset}
            className="glass rounded-full px-5 py-3 text-white text-sm font-display hover:scale-105 transition-transform"
          >
            Reset
          </button>
        </div>

        <p className="text-white/50 text-xs font-body text-center max-w-sm">
          A calming box-breathing rhythm. Follow the circle — inhale as it grows, exhale as it shrinks.
        </p>
      </div>
    </div>
  );
};

export default Breathing;
