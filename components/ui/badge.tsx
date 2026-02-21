import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const variants: Record<BadgeVariant, string> = {
  default: "bg-zinc-900 text-white border-zinc-900",
  secondary: "bg-zinc-100 text-zinc-700 border-zinc-200",
  outline: "bg-white text-zinc-700 border-zinc-200",
  destructive: "bg-rose-50 text-rose-700 border-rose-200",
};

export function Badge({ className, variant = "secondary", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", variants[variant], className)}
      {...props}
    />
  );
}
