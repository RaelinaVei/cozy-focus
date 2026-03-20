import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Trash2, ListTodo, ChevronDown, ChevronUp } from "lucide-react";

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export function TodoTracker() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem("pomodoro-todos");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false);

  const save = (items: Todo[]) => {
    setTodos(items);
    localStorage.setItem("pomodoro-todos", JSON.stringify(items));
  };

  const addTodo = () => {
    if (!input.trim()) return;
    save([...todos, { id: Date.now().toString(), text: input.trim(), done: false }]);
    setInput("");
  };

  const toggleTodo = (id: string) => {
    save(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id: string) => {
    save(todos.filter((t) => t.id !== id));
  };

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden w-80 max-w-full"
    >
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between p-4 timer-text"
      >
        <div className="flex items-center gap-2 text-sm font-display font-medium">
          <ListTodo className="w-4 h-4" />
          Tasks {todos.length > 0 && `(${doneCount}/${todos.length})`}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  placeholder="Add a task..."
                  className="flex-1 bg-transparent border border-border/30 rounded-lg px-3 py-2 text-sm font-body timer-text placeholder:text-foreground/40 focus:outline-none focus:border-foreground/50"
                />
                <button
                  onClick={addTodo}
                  className="p-2 rounded-lg bg-foreground/10 hover:bg-foreground/20 transition-colors timer-text"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {todos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-2 group"
                    >
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                          todo.done
                            ? "bg-foreground/30 border-foreground/30"
                            : "border-foreground/30 hover:border-foreground/60"
                        }`}
                      >
                        {todo.done && <Check className="w-3 h-3 timer-text" />}
                      </button>
                      <span
                        className={`flex-1 text-sm font-body timer-text ${
                          todo.done ? "line-through opacity-50" : ""
                        }`}
                      >
                        {todo.text}
                      </span>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 transition-opacity timer-text"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
