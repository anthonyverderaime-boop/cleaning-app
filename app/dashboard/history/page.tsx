import { CalendarRange } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getDisplayName } from "@/utils/user/displayName";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "../_components/EmptyState";
import PageHeader from "../_components/PageHeader";
import HistoryTable, { type HistoryRow } from "../_components/HistoryTable";

type CleaningHistoryRow = {
  day: string;
  checked_items: string[] | null;
  completed_at: string;
};

type ChecklistItem = {
  label: string;
};

export default async function CleaningHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  const displayName = getDisplayName(user);

  const { data: historyRows } = await supabase
    .from("cleaning_history")
    .select("day,checked_items,completed_at")
    .eq("user_id", user.id)
    .order("day", { ascending: false })
    .returns<CleaningHistoryRow[]>();

  const { data: checklistItems } = await supabase
    .from("cleaning_checklist_items")
    .select("label")
    .eq("is_active", true)
    .returns<ChecklistItem[]>();

  const checklistCount = checklistItems?.length ?? 0;

  const tableRows: HistoryRow[] = (historyRows ?? []).map((row) => {
    const checkedCount = row.checked_items?.length ?? 0;
    return {
      day: row.day,
      worker: displayName,
      status: "Completed",
      completedAt: row.completed_at,
      completedTasks: checkedCount,
      totalTasks: checklistCount > 0 ? checklistCount : checkedCount,
      photosCount: 0,
      checkedItems: row.checked_items ?? [],
    };
  });

  const monthSummary = Object.entries(
    tableRows.reduce<Record<string, number>>((acc, row) => {
      const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
        new Date(`${row.day}T00:00:00`)
      );
      acc[monthLabel] = (acc[monthLabel] ?? 0) + 1;
      return acc;
    }, {})
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20 md:pb-0">
        <PageHeader
          title="History"
          description="Filter and inspect completed cleaning records."
        />

        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <p className="text-lg font-medium text-zinc-900">Monthly totals</p>
            {monthSummary.length === 0 ? (
              <p className="text-sm text-zinc-600">No cleaning history yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {monthSummary.map(([month, count]) => (
                  <Badge key={month} variant="outline">
                    <CalendarRange size={12} />
                    {month}: {count}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {tableRows.length === 0 ? (
          <EmptyState
            icon={CalendarRange}
            title="No cleanings yet"
            description="Completed cleanings will appear here once tasks are marked complete."
          />
        ) : (
          <HistoryTable rows={tableRows} />
        )}
      </div>
    </div>
  );
}
