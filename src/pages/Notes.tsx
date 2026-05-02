import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, BookMarked } from "lucide-react";
import { LiveBackground } from "@/components/LiveBackground";
import { FullscreenButton } from "@/components/FullscreenButton";
import { subjects } from "@/lib/subjectsData";

const Notes = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <LiveBackground variant="aurora" />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4">
        <Link
          to="/"
          className="glass rounded-full p-2.5 text-white hover:scale-110 transition-transform"
          title="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2"
        >
          <BookMarked className="w-5 h-5" /> notes
        </motion.h1>
        <div className="w-9" />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-5 pt-24 pb-24">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-white/70 text-xs sm:text-sm mb-3 font-body tracking-[0.3em] uppercase"
        >
          your study library
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: -20, letterSpacing: "0.4em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.05em" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl sm:text-6xl font-bold text-white mb-3"
          style={{ textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}
        >
          subjects
        </motion.h2>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "3rem" }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="h-px bg-white/60 mb-10"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full max-w-4xl">
          {subjects.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.08, ease: [0.22, 1, 0.36, 1], duration: 0.6 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to={`/notes/${s.id}`}
                  className="glass group rounded-2xl p-5 sm:p-6 flex items-start gap-4 active:scale-[0.99] transition-transform block relative overflow-hidden h-full"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-60 group-hover:opacity-90 transition-opacity`}
                  />
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                  <motion.div
                    className="relative rounded-xl bg-white/15 p-3 group-hover:bg-white/25 transition-colors"
                    whileHover={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="relative flex-1 min-w-0">
                    <h3 className="font-display text-lg sm:text-xl font-semibold text-white mb-1">
                      {s.name}
                    </h3>
                    <p className="text-white/70 text-xs sm:text-sm font-body">{s.tagline}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-white/50 text-xs mt-12 font-body tracking-[0.3em] uppercase"
        >
          everything saved on this device
        </motion.p>
      </div>

      <FullscreenButton />
    </div>
  );
};

export default Notes;
