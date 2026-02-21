import { User2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import StatusBadge, { type DayStatus } from "./StatusBadge";

function initialsFromEmail(email: string | null) {
  if (!email) return "?";
  return email
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export type CalendarDayCardItem = {
  dayKey: string;
  dayNumber: number;
  status: DayStatus;
  isPastOrToday: boolean;
  isToday?: boolean;
  assignedEmail: string | null;
  progressLabel?: string | null;
  progressPct?: number | null;
};

export default function CalendarDayCard({ day, onClick }: { day: CalendarDayCardItem; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={`min-h-[110px] h-full w-full cursor-pointer rounded-xl border border-zinc-200 bg-white p-3 text-left shadow-sm transition hover:border-zinc-300 hover:bg-white hover:shadow-md ${
        day.isPastOrToday ? "bg-zinc-50 hover:bg-zinc-50" : ""
      } ${
        day.isToday ? "ring-2 ring-zinc-300" : ""
      }`}
      onClick={onClick}
      aria-label={`Open day ${day.dayKey}`}
    >
      <div className="w-full space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-zinc-900">{day.dayNumber}</p>
          <StatusBadge status={day.status} />
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <Avatar initials={initialsFromEmail(day.assignedEmail)} className="h-6 w-6 text-[10px]" />
          <User2 size={12} />
          <span className="truncate">{day.assignedEmail ?? "Unassigned"}</span>
        </div>

        {day.progressLabel ? (
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-zinc-600">{day.progressLabel}</p>
            <Progress value={day.progressPct ?? 0} />
          </div>
        ) : null}
      </div>
    </Button>
  );
}
