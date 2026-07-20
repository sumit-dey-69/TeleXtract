import { cn } from "@/lib/utils";

export function StatusEyebrow({ online, label }: { online: boolean; label: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 font-mono text-xs tracking-[.18em] uppercase",
        online ? "text-accent" : "text-muted"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          online ? "bg-accent shadow-[0_0_8px_var(--accent)] animate-pulse-dot" : "bg-muted"
        )}
      />
      <span>{label}</span>
    </div>
  );
}
