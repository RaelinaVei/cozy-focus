import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { LiveBackground } from "@/components/LiveBackground";

const pad = (n: number) => Math.max(0, Math.floor(n)).toString().padStart(2, "0");

const PRESETS = [
  { label: "5m", s: 5 * 60 },
  { label: "10m", s: 10 * 60 },
  { label: "15m", s: 15 * 60 },
  { label: "25m", s: 25 * 60 },
  { label: "45m", s: 45 * 60 },
  { label: "1h", s: 60 * 60 },
];

const Countdown = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.connect(g); g.connect(ctx.destination);
              o.frequency.value = 880;
              g.gain.setValueAtTime(0.5, ctx.currentTime);
              g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
              o.start(); o.stop(ctx.currentTime + 1);
            } catch {}
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, remaining]);

  const start = () => {
    if (remaining === 0) {
      const t = hours * 3600 + minutes * 60 + seconds;
      if (t === 0) return;
      setRemaining(t);
      setTotal(t);
    }
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setRemaining(0); setTotal(0); };

  const applyPreset = (s: number) => {
    setRunning(false);
    setRemaining(0);
    setTotal(0);
    setHours(Math.floor(s / 3600));
    setMinutes(Math.floor((s % 3600) / 60));
    setSeconds(s % 60);
  };

  const displaySecs = remaining > 0 ? remaining : hours * 3600 + minutes * 60 + seconds;
  const hh = pad(displaySecs / 3600);
  const mm = pad((displaySecs % 3600) / 60);
  const ss = pad(displaySecs % 60);
  const progress = total > 0 ? 1 - remaining / total : 0;

  const isEditing = remaining === 0 && !running;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <LiveBackground variant="sunset" />

      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-5 py-4">
        <Link to="/" className="glass rounded-full p-2.5 text-white hover:scale-110 transition-transform">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-display text-white text-lg font-semibold tracking-wide">countdown</h1>
        <div className="w-9" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 gap-6 pt-20 pb-10">
        {/* Progress ring + value */}
        <div className="relative">
          <svg className="w-[260px] h-[260px] sm:w-80 sm:h-80 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <motion.circle
              cx="50" cy="50" r="46" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round"
              pathLength={1}
              style={{ pathLength: progress }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center px-4">
            {isEditing ? (
              <div className="flex items-end gap-1 text-white">
                <NumberInput value={hours} onChange={setHours} max={23} label="hr" />
                <span className="text-3xl sm:text-4xl opacity-60 pb-4">:</span>
                <NumberInput value={minutes} onChange={setMinutes} max={59} label="min" />
                <span className="text-3xl sm:text-4xl opacity-60 pb-4">:</span>
                <NumberInput value={seconds} onChange={setSeconds} max={59} label="sec" />
              </div>
            ) : (
              <div className="font-display font-light text-white text-4xl sm:text-5xl tabular-nums tracking-tight"
                style={{ letterSpacing: "-0.03em" }}>
                {(hours > 0 || parseInt(hh) > 0) && `${hh}:`}
                {mm}:{ss}
              </div>
            )}
          </div>
        </div>

        {/* Presets */}
        {isEditing && (
          <div className="flex flex-wrap justify-center gap-2 max-w-sm">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.s)}
                className="glass rounded-full px-4 py-1.5 text-white text-xs font-display font-medium hover:scale-105 transition-transform"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!running ? (
            <button
              onClick={start}
              className="glass rounded-full px-7 py-3 text-white font-display font-medium flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Play className="w-4 h-4" /> Start
            </button>
          ) : (
            <button
              onClick={pause}
              className="glass rounded-full px-7 py-3 text-white font-display font-medium flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
          )}
          <button
            onClick={reset}
            className="glass rounded-full p-3 text-white hover:scale-110 transition-transform"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const NumberInput = ({
  value, onChange, max, label,
}: { value: number; onChange: (n: number) => void; max: number; label: string }) => (
  <div className="flex flex-col items-center">
    <input
      type="number"
      min={0}
      max={max}
      value={value}
      onChange={(e) => {
        const n = parseInt(e.target.value) || 0;
        onChange(Math.min(max, Math.max(0, n)));
      }}
      className="w-14 sm:w-20 bg-transparent font-display font-light text-3xl sm:text-5xl text-center text-white outline-none tabular-nums
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      style={{ letterSpacing: "-0.03em" }}
    />
    <span className="text-[10px] uppercase tracking-widest text-white/60">{label}</span>
  </div>
);

export default Countdown;
