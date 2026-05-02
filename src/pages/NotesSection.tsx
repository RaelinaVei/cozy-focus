import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Pin, PinOff, Search, X } from "lucide-react";
import { LiveBackground } from "@/components/LiveBackground";
import { FullscreenButton } from "@/components/FullscreenButton";
import { getSubject, getSection } from "@/lib/subjectsData";
import { loadEntries, saveEntries, newId, type NoteEntry, type TeacherEntry } from "@/lib/notesStore";

const NotesSection = () => {
  const { subjectId = "", sectionId = "" } = useParams();
  const subject = getSubject(subjectId);
  const section = getSection(subjectId, sectionId);
  const isTeachers = sectionId === "teachers";

  const [entries, setEntries] = useState<(NoteEntry | TeacherEntry)[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (subject && section) setEntries(loadEntries(subjectId, sectionId));
  }, [subjectId, sectionId, subject, section]);

  const persist = (next: (NoteEntry | TeacherEntry)[]) => {
    setEntries(next);
    saveEntries(subjectId, sectionId, next);
  };

  const addEntry = () => {
    const base = { id: newId(), body: "", updatedAt: Date.now() };
    const entry = isTeachers
      ? ({ ...base, teacher: "New Teacher", subjectTopic: "" } as TeacherEntry)
      : ({ ...base, title: "Untitled note" } as NoteEntry);
    const next = [entry, ...entries];
    persist(next);
    setOpenId(entry.id);
  };

  const updateEntry = (id: string, patch: Partial<NoteEntry & TeacherEntry>) => {
    const next = entries.map((e) =>
      e.id === id ? ({ ...e, ...patch, updatedAt: Date.now() } as NoteEntry | TeacherEntry) : e,
    );
    persist(next);
  };

  const removeEntry = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
    if (openId === id) setOpenId(null);
  };

  const togglePin = (id: string) => {
    const target = entries.find((e) => e.id === id);
    if (!target) return;
    updateEntry(id, { pinned: !target.pinned });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? entries.filter((e) => {
          const title = isTeachers ? (e as TeacherEntry).teacher : (e as NoteEntry).title;
          const topic = isTeachers ? (e as TeacherEntry).subjectTopic ?? "" : "";
          return (
            title.toLowerCase().includes(q) ||
            topic.toLowerCase().includes(q) ||
            e.body.toLowerCase().includes(q)
          );
        })
      : entries;
    return [...list].sort((a, b) => {
      const pa = a.pinned ? 1 : 0;
      const pb = b.pinned ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return b.updatedAt - a.updatedAt;
    });
  }, [entries, query, isTeachers]);

  const openEntry = entries.find((e) => e.id === openId) || null;

  if (!subject || !section) return <Navigate to="/notes" replace />;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <LiveBackground variant="aurora" />
      <div
        className={`absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-60 pointer-events-none`}
      />

      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4">
        <Link
          to={`/notes/${subject.id}`}
          className="glass rounded-full p-2.5 text-white hover:scale-110 transition-transform"
          title={`Back to ${subject.name}`}
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-base sm:text-xl font-bold text-white tracking-wide text-center"
        >
          {subject.name.toLowerCase()} · <span className="opacity-80">{section.title.toLowerCase()}</span>
        </motion.h1>
        <div className="w-9" />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-20 pb-24">
        {/* Search + Add bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl flex items-center gap-2 mb-5"
        >
          <div className="glass rounded-full flex items-center gap-2 px-4 py-2 flex-1">
            <Search className="w-4 h-4 text-white/70" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isTeachers ? "Search teachers or notes…" : "Search notes…"}
              className="bg-transparent text-white placeholder:text-white/50 text-sm font-body w-full focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={addEntry}
            className="glass rounded-full px-4 py-2 text-white text-sm font-display font-medium flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" /> {isTeachers ? "Teacher" : "Note"}
          </button>
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-10 max-w-md text-center mt-10"
          >
            <p className="text-white/80 font-display text-lg mb-2">Nothing here yet</p>
            <p className="text-white/60 text-sm font-body">
              {isTeachers
                ? "Add your first teacher's notes — perfect place to keep their lessons sorted."
                : "Tap the + button to start writing your first note."}
            </p>
          </motion.div>
        )}

        {/* Cards grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((e, i) => {
              const title = isTeachers ? (e as TeacherEntry).teacher : (e as NoteEntry).title;
              const topic = isTeachers ? (e as TeacherEntry).subjectTopic : undefined;
              const preview = e.body.trim().slice(0, 140) || "No content yet…";
              return (
                <motion.button
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  whileHover={{ y: -3 }}
                  onClick={() => setOpenId(e.id)}
                  className="glass group rounded-2xl p-4 text-left relative overflow-hidden flex flex-col gap-2 min-h-[140px]"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                  <div className="flex items-start justify-between gap-2 relative">
                    <h3 className="font-display text-white font-semibold text-base leading-tight line-clamp-2">
                      {title || "Untitled"}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span
                        onClick={(ev) => { ev.stopPropagation(); togglePin(e.id); }}
                        className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
                        title={e.pinned ? "Unpin" : "Pin"}
                      >
                        {e.pinned ? <Pin className="w-3.5 h-3.5 fill-white" /> : <PinOff className="w-3.5 h-3.5" />}
                      </span>
                      <span
                        onClick={(ev) => { ev.stopPropagation(); if (confirm("Delete this note?")) removeEntry(e.id); }}
                        className="text-white/60 hover:text-rose-300 p-1 rounded-full hover:bg-white/10 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                  {topic && (
                    <p className="text-white/70 text-xs font-body italic relative">{topic}</p>
                  )}
                  <p className="text-white/70 text-xs font-body line-clamp-4 relative">{preview}</p>
                  <p className="text-white/40 text-[10px] font-body mt-auto relative">
                    {new Date(e.updatedAt).toLocaleString()}
                  </p>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <FullscreenButton />

      {/* Editor modal */}
      <AnimatePresence>
        {openEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpenId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <span className="text-white/60 text-[11px] font-body uppercase tracking-[0.25em]">
                  {subject.name} · {section.title}
                </span>
                <button
                  onClick={() => setOpenId(null)}
                  className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-3 overflow-y-auto">
                {isTeachers ? (
                  <>
                    <input
                      value={(openEntry as TeacherEntry).teacher}
                      onChange={(ev) => updateEntry(openEntry.id, { teacher: ev.target.value })}
                      placeholder="Teacher's name"
                      className="bg-transparent text-white font-display text-2xl font-semibold w-full focus:outline-none placeholder:text-white/40"
                    />
                    <input
                      value={(openEntry as TeacherEntry).subjectTopic ?? ""}
                      onChange={(ev) => updateEntry(openEntry.id, { subjectTopic: ev.target.value })}
                      placeholder="Topic / chapter (optional)"
                      className="bg-transparent text-white/80 font-body text-sm w-full focus:outline-none border-b border-white/10 pb-2 placeholder:text-white/40"
                    />
                  </>
                ) : (
                  <input
                    value={(openEntry as NoteEntry).title}
                    onChange={(ev) => updateEntry(openEntry.id, { title: ev.target.value })}
                    placeholder="Title"
                    className="bg-transparent text-white font-display text-2xl font-semibold w-full focus:outline-none placeholder:text-white/40"
                  />
                )}

                <textarea
                  value={openEntry.body}
                  onChange={(ev) => updateEntry(openEntry.id, { body: ev.target.value })}
                  placeholder="Start writing… everything saves automatically."
                  className="bg-transparent text-white/90 font-body text-sm leading-relaxed w-full min-h-[40vh] focus:outline-none placeholder:text-white/40 resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-white/10">
                <span className="text-white/40 text-[11px] font-body">
                  Saved · {new Date(openEntry.updatedAt).toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePin(openEntry.id)}
                    className="glass rounded-full px-3 py-1.5 text-white text-xs font-body flex items-center gap-1.5 hover:scale-105 transition-transform"
                  >
                    {openEntry.pinned ? <Pin className="w-3.5 h-3.5 fill-white" /> : <PinOff className="w-3.5 h-3.5" />}
                    {openEntry.pinned ? "Pinned" : "Pin"}
                  </button>
                  <button
                    onClick={() => { if (confirm("Delete this note?")) removeEntry(openEntry.id); }}
                    className="glass rounded-full px-3 py-1.5 text-rose-200 text-xs font-body flex items-center gap-1.5 hover:scale-105 transition-transform"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesSection;
