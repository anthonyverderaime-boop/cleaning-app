"use client";

import Link from "next/link";
import { CalendarCheck2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import StatusBadge, { type DayStatus } from "./StatusBadge";

export type DayDetails = {
  dayKey: string;
  status: DayStatus;
  isPastOrToday: boolean;
  assignedEmail: string | null;
  progressLabel?: string | null;
  completedAt?: string | null;
  checklistHref?: string | null;
  historyHref?: string | null;
};

function formatDayLabel(dayKey: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dayKey}T00:00:00`));
}

export default function DayDetailsSheet({
  day,
  open,
  onOpenChange,
  claimAction,
  unclaimAction,
  undoCompleteAction,
}: {
  day: DayDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimAction: (formData: FormData) => Promise<void>;
  unclaimAction: (formData: FormData) => Promise<void>;
  undoCompleteAction: (formData: FormData) => Promise<void>;
}) {
  if (!day) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <SheetHeader>
              <SheetDescription>Day details</SheetDescription>
              <SheetTitle>{formatDayLabel(day.dayKey)}</SheetTitle>
            </SheetHeader>
            <Button size="icon" variant="ghost" onClick={() => onOpenChange(false)} aria-label="Close day details">
              <X size={14} />
            </Button>
          </div>

          <StatusBadge status={day.status} />

          <Card>
            <CardContent className="space-y-2 p-4 text-sm text-zinc-700">
              <p>
                Assigned user: <span className="font-medium">{day.assignedEmail ?? "Unassigned"}</span>
              </p>
              {day.progressLabel ? <p>Progress: {day.progressLabel}</p> : null}
              {day.completedAt ? (
                <p>
                  Last completed:{" "}
                  <span className="font-medium">{new Date(day.completedAt).toLocaleString("en-US")}</span>
                </p>
              ) : null}
            </CardContent>
          </Card>

          {day.status === "unclaimed" && !day.isPastOrToday ? (
            <form action={claimAction}>
              <input type="hidden" name="day" value={day.dayKey} />
              <Button className="w-full" type="submit">
                <CalendarCheck2 size={14} />
                Claim day
              </Button>
            </form>
          ) : null}

          {day.status === "mine" ? (
            <div className="space-y-2">
              {day.checklistHref ? (
                <Button asChild className="w-full">
                  <Link href={day.checklistHref}>
                    <FileText size={14} />
                    Open checklist
                  </Link>
                </Button>
              ) : null}
              <form action={unclaimAction}>
                <input type="hidden" name="day" value={day.dayKey} />
                <Button className="w-full" variant="outline" type="submit">
                  Unclaim
                </Button>
              </form>
            </div>
          ) : null}

          {day.status === "completed" && day.historyHref ? (
            <div className="space-y-2">
              <Button asChild className="w-full" variant="secondary">
                <Link href={day.historyHref}>
                  View report
                </Link>
              </Button>
              <form action={undoCompleteAction}>
                <input type="hidden" name="day" value={day.dayKey} />
                <Button className="w-full" variant="outline" type="submit">
                  Undo completion
                </Button>
              </form>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
