interface Props {
  completed: number;
  total: number;
}

export function SessionCounter({ completed, total }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            i < completed
              ? "bg-foreground/70 scale-100"
              : "bg-foreground/20 scale-90"
          }`}
          style={{ filter: i < completed ? "drop-shadow(0 0 4px hsla(0,0%,100%,0.5))" : undefined }}
        />
      ))}
    </div>
  );
}
