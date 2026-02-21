import { cn } from "@/lib/utils";

export default function StickyActionBar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-3 z-20 flex flex-wrap gap-2 rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-sm backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}
