import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-display text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground hover:bg-[#7ff3e0] active:scale-[.97]",
        secondary:
          "bg-transparent border border-border text-foreground hover:border-accent hover:text-accent",
        outline: "bg-transparent border border-border text-muted-foreground hover:border-accent hover:text-accent",
        ghost: "bg-transparent border border-border text-muted-foreground hover:border-err hover:text-err",
        destructive: "bg-transparent border border-err text-err hover:bg-err hover:text-[#2a0b09]",
        link: "text-muted-foreground underline underline-offset-4 hover:text-foreground",
      },
      size: {
        default: "h-[46px] px-5 text-sm",
        sm: "h-9 px-3.5 text-xs",
        pill: "h-8 px-4 text-xs rounded-full",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
