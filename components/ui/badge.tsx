import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-display text-[11px] font-semibold uppercase tracking-[.03em] whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "text-foreground",
        muted: "text-muted",
        accent: "text-accent",
        warn: "text-warn",
        err: "text-err",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
