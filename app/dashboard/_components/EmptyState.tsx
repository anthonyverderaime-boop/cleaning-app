import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-6 text-center">
        <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
          <Icon size={18} />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-medium text-zinc-900">{title}</p>
          <p className="text-sm text-zinc-600">{description}</p>
        </div>
        {action ? action : null}
        {!action && actionLabel && onAction ? (
          <Button type="button" variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
