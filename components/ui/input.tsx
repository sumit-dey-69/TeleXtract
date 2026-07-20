import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-[46px] w-full min-w-0 rounded-md border border-border bg-background-grid px-3.5 py-3 font-mono text-[13.5px] text-foreground outline-none transition-colors placeholder:text-[#4e5a75] focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
