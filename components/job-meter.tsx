import { cn } from "@/lib/utils";

export function JobMeter({ pct, paused }: { pct: number; paused?: boolean }) {
  const bars = 24;
  const lit = Math.round((pct / 100) * bars);
  return (
    <div className="flex h-[22px] items-end gap-[3px]">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-[30%] flex-1 rounded-sm bg-border transition-all",
            i < lit && (paused ? "h-full bg-warn" : "h-full bg-accent")
          )}
        />
      ))}
    </div>
  );
}
