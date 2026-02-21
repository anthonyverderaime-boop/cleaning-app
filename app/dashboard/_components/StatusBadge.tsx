import { Badge } from "@/components/ui/badge";

export type DayStatus = "unclaimed" | "mine" | "other" | "completed";

const labels: Record<DayStatus, string> = {
  unclaimed: "Unclaimed",
  mine: "Assigned to you",
  other: "Assigned to other",
  completed: "Completed",
};

const classMap: Record<DayStatus, string> = {
  unclaimed: "bg-zinc-100 text-zinc-700 border-zinc-200",
  mine: "bg-sky-50 text-sky-700 border-sky-200",
  other: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function StatusBadge({ status }: { status: DayStatus }) {
  return <Badge className={classMap[status]}>{labels[status]}</Badge>;
}
