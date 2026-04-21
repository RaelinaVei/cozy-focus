import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Moon, Sun, Palette, Clock as ClockIcon, Hourglass, Play, Pause, RotateCcw } from "lucide-react";
import { FlipDigit } from "@/components/FlipDigit";

const pad = (n: number) => Math.max(0, Math.floor(n)).toString().padStart(2, "0");

type BgMode = "dark" | "light" | "aurora" | "sunset" | "ocean" | "rose" | "mint";

const gradients: Record<Exclude<BgMode, "dark" | "light">, string> = {
  aurora: "linear-gradient(135deg, #0f172a, #1e1b4b, #312e81, #0f766e)",
  sunset: "linear-gradient(135deg, #1a1033, #4a1a4a, #7a2d4a, #c2410c)",
  ocean: "linear-gradient(135deg, #020617, #0c4a6e, #155e75, #0e7490)",
  rose: "linear-gradient(135deg, #1a0a14, #4a1a3a, #9d174d, #f43f5e)",
  mint: "linear-gradient(135deg, #022c22, #065f46, #10b981, #a7f3d0)",
};

const FlipClock = () => {
  const [mode, setMode] = useState<"clock" | "timer">("clock");
  const [now, setNow] = useState(new Date());
  const [bg, setBg] = useState<BgMode>("dark");
  const [showPalette, setShowPalette] = useState(false);

  // Timer state
  const [inH, setInH] = useState(0);
  const [inM, setInM] = useState(10);
  const [inS, setInS] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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

  const startTimer = () => {
    if (remaining === 0) {
      const t = inH * 3600 + inM * 60 + inS;
      if (t === 0) return;
      setRemaining(t);
    }
    setRunning(true);
  };
  const pauseTimer = () => setRunning(false);
  const resetTimer = () => { setRunning(false); setRemaining(0); };

  const isLight = bg === "light";
  const isDigitDark = !isLight;
  const textColor = isLight ? "text-neutral-900" : "text-white";
  const subtle = isLight ? "text-black/50" : "text-white/60";
  const borderCls = isLight ? "border-black/10 hover:bg-black/5" : "border-white/15 hover:bg-white/10";

  const bgStyle: React.CSSProperties =
    bg === "dark" ? { background: "#000" }
    : bg === "light" ? { background: "#f5f5f5" }
    : { backgroundImage: gradients[bg], backgroundSize: "300% 300%" };

  // Choose what to display
  let hh: string, mm: string, ss: string;
  if (mode === "clock") {
    hh = pad(now.getHours()); mm = pad(now.getMinutes()); ss = pad(now.getSeconds());
  } else {
    const showSecs = remaining > 0 || running ? remaining : inH * 3600 + inM * 60 + inS;
    hh = pad(showSecs / 3600); mm = pad((showSecs % 3600) / 60); ss = pad(showSecs % 60);
  }

  const isEditing = mode === "timer" && remaining === 0 && !running;

  return (
    <div className={`relative min-h-screen w-full overflow-hidden transition-colors ${textColor}`}>
      <motion.div
        className="absolute inset-0"
        style={bgStyle}
        animate={bg !== "dark" && bg !== "light"
          ? { backgroundPosition: ["0% 0%", "100% 100%", "0% 100%", "100% 0%", "0% 0%"] }
          : undefined}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      {bg !== "dark" && bg !== "light" && <div className="absolute inset-0 bg-black/20" />}

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-5 py-4 gap-2">
        <Link
          to="/"
          className={`rounded-full p-2.5 border backdrop-blur-md ${borderCls} transition-colors shrink-0`}
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {/* Mode toggle */}
        <div className={`flex rounded-full border backdrop-blur-md ${isLight ? "border-black/10" : "border-white/15"} p-1`}>
          <button
            onClick={() => setMode("clock")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium transition-colors ${
              mode === "clock"
                ? (isLight ? "bg-black/10" : "bg-white/20")
                : "opacity-60"
            }`}
          >
            <ClockIcon className="w-3.5 h-3.5" /> Clock
          </button>
          <button
            onClick={() => setMode("timer")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium transition-colors ${
              mode === "timer"
                ? (isLight ? "bg-black/10" : "bg-white/20")
                : "opacity-60"
            }`}
          >
            <Hourglass className="w-3.5 h-3.5" /> Timer
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowPalette((s) => !s)}
              className={`rounded-full p-2.5 border backdrop-blur-md ${borderCls} transition-colors`}
              title="Background"
            >
              <Palette className="w-4 h-4" />
            </button>
            {showPalette && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 rounded-2xl p-3 backdrop-blur-xl bg-black/50 border border-white/15 flex gap-2 z-30"
              >
                {(["dark", "light", "aurora", "sunset", "ocean", "rose", "mint"] as BgMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setBg(m); setShowPalette(false); }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      bg === m ? "border-white scale-110" : "border-white/30"
                    }`}
                    style={
                      m === "dark" ? { background: "#000" }
                      : m === "light" ? { background: "#f5f5f5" }
                      : { backgroundImage: gradients[m] }
                    }
                    title={m}
                  />
                ))}
              </motion.div>
            )}
          </div>
          <button
            onClick={() => setBg(isLight ? "dark" : "light")}
            className={`rounded-full p-2.5 border backdrop-blur-md ${borderCls} transition-colors`}
            title="Toggle light/dark"
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 gap-6 pt-20 pb-10">
        {isEditing ? (
          <div className={`flex items-end gap-2 sm:gap-4 ${textColor}`}>
            <NumberInput value={inH} onChange={setInH} max={23} label="hr" light={isLight} />
            <span className={`text-4xl sm:text-7xl font-bold ${subtle} pb-4`}>:</span>
            <NumberInput value={inM} onChange={setInM} max={59} label="min" light={isLight} />
            <span className={`text-4xl sm:text-7xl font-bold ${subtle} pb-4`}>:</span>
            <NumberInput value={inS} onChange={setInS} max={59} label="sec" light={isLight} />
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex gap-1 sm:gap-2">
              <FlipDigit value={hh[0]} dark={isDigitDark} />
              <FlipDigit value={hh[1]} dark={isDigitDark} />
            </div>
            <span className={`text-4xl sm:text-7xl font-bold ${subtle}`}>:</span>
            <div className="flex gap-1 sm:gap-2">
              <FlipDigit value={mm[0]} dark={isDigitDark} />
              <FlipDigit value={mm[1]} dark={isDigitDark} />
            </div>
            <span className={`text-4xl sm:text-7xl font-bold ${subtle}`}>:</span>
            <div className="flex gap-1 sm:gap-2">
              <FlipDigit value={ss[0]} dark={isDigitDark} />
              <FlipDigit value={ss[1]} dark={isDigitDark} />
            </div>
          </div>
        )}

        {mode === "clock" ? (
          <p className={`font-body text-sm tracking-[0.3em] uppercase ${subtle}`}>
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
        ) : (
          <div className="flex items-center gap-3">
            {!running ? (
              <button
                onClick={startTimer}
                className={`rounded-full px-7 py-3 font-display font-medium flex items-center gap-2 border backdrop-blur-md ${borderCls} transition-all hover:scale-105`}
              >
                <Play className="w-4 h-4" /> Start
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className={`rounded-full px-7 py-3 font-display font-medium flex items-center gap-2 border backdrop-blur-md ${borderCls} transition-all hover:scale-105`}
              >
                <Pause className="w-4 h-4" /> Pause
              </button>
            )}
            <button
              onClick={resetTimer}
              className={`rounded-full p-3 border backdrop-blur-md ${borderCls} transition-all hover:scale-110`}
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const NumberInput = ({
  value, onChange, max, label, light,
}: { value: number; onChange: (n: number) => void; max: number; label: string; light: boolean }) => (
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
      className={`w-[72px] sm:w-32 bg-transparent font-display font-bold text-5xl sm:text-8xl text-center outline-none tabular-nums
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
        ${light ? "text-neutral-900" : "text-white"}`}
    />
    <span className={`text-[10px] uppercase tracking-widest ${light ? "text-black/50" : "text-white/60"}`}>{label}</span>
  </div>
);

export default FlipClock;
