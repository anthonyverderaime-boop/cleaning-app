import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { buildChecklistForDay } from "@/utils/checklist/daySpecific";
import { getDisplayName } from "@/utils/user/displayName";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ActionToast from "./_components/ActionToast";
import CalendarGrid, { CalendarGridSkeleton, type CalendarDayItem } from "./_components/CalendarGrid";
import PageHeader from "./_components/PageHeader";

type CleaningAssignment = {
  day: string;
  user_id: string;
  cleaner_email: string | null;
};

type CleaningHistory = {
  day: string;
  checked_items: string[] | null;
  completed_at?: string | null;
};

type ChecklistItem = {
  label: string;
};

const fallbackChecklistItems = [
  "Bring supplies (spray, microfiber cloth, trash bags)",
  "Open windows or ventilation",
  "Collect and remove trash",
  "Dust surfaces (high to low)",
  "Wipe counters and tables",
  "Clean sinks and faucets",
  "Scrub toilet and disinfect handle",
  "Vacuum rugs and high-traffic areas",
  "Mop hard floors",
  "Restock paper towels / soap",
  "Final walkthrough and lock up",
];

function pad2(value: number) {
  return value.toString().padStart(2, "0");
}

function dateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function todayKeyLocal() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

function sanitizeDay(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

function parseMonth(value?: string) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth() };
  }

  const [year, month] = value.split("-").map(Number);
  return { year, monthIndex: month - 1 };
}

function shiftMonth(year: number, monthIndex: number, offset: number) {
  const date = new Date(year, monthIndex + offset, 1);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

async function claimDay(formData: FormData) {
  "use server";

  const day = sanitizeDay(formData.get("day"));
  if (!day || day <= todayKeyLocal()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: existing, error: existingError } = await supabase
    .from("cleaning_assignments")
    .select("user_id")
    .eq("day", day)
    .maybeSingle();

  if (existingError && existingError.code !== "PGRST116") return;
  if (existing?.user_id) return;

  const { error } = await supabase.from("cleaning_assignments").insert({
    day,
    user_id: user.id,
    cleaner_email: getDisplayName(user),
  });

  if (error && error.code !== "23505") return;

  revalidatePath("/dashboard");
  redirect(`/dashboard?month=${day.slice(0, 7)}&toast=claimed`);
}

async function unclaimDay(formData: FormData) {
  "use server";

  const day = sanitizeDay(formData.get("day"));
  if (!day) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  await supabase.from("cleaning_assignments").delete().eq("day", day).eq("user_id", user.id);
  revalidatePath("/dashboard");
  redirect(`/dashboard?month=${day.slice(0, 7)}&toast=unclaimed`);
}

type DashboardPageProps = {
  searchParams: Promise<{ month?: string; toast?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;
  const { year, monthIndex } = parseMonth(params.month);

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(year, monthIndex, 1)
  );

  const monthStart = dateKey(year, monthIndex, 1);
  const monthEnd = dateKey(year, monthIndex, daysInMonth);
  const todayKey = todayKeyLocal();

  const { data: assignments, error: assignmentsError } = await supabase
    .from("cleaning_assignments")
    .select("day,user_id,cleaner_email")
    .gte("day", monthStart)
    .lte("day", monthEnd)
    .returns<CleaningAssignment[]>();

  const { data: checklistItems } = await supabase
    .from("cleaning_checklist_items")
    .select("label")
    .eq("is_active", true)
    .returns<ChecklistItem[]>();

  const baseChecklist =
    checklistItems && checklistItems.length > 0
      ? checklistItems.map((item) => item.label)
      : fallbackChecklistItems;

  const { data: historyRows } = await supabase
    .from("cleaning_history")
    .select("day,checked_items,completed_at")
    .eq("user_id", user.id)
    .gte("day", monthStart)
    .lte("day", monthEnd)
    .returns<CleaningHistory[]>();

  const assignmentByDay = new Map((assignments ?? []).map((assignment) => [assignment.day, assignment]));
  const historyByDay = new Map((historyRows ?? []).map((row) => [row.day, row]));

  const calendarDays: CalendarDayItem[] = Array.from({ length: daysInMonth }, (_, index) => {
    const dayNumber = index + 1;
    const dayKey = dateKey(year, monthIndex, dayNumber);
    const assignment = assignmentByDay.get(dayKey);
    const history = historyByDay.get(dayKey);
    const isMine = assignment?.user_id === user.id;

    const totalTasks = buildChecklistForDay(dayKey, baseChecklist).length;
    const checkedCount = history?.checked_items?.length ?? 0;
    const progressLabel = checkedCount > 0 ? `${checkedCount}/${totalTasks}` : null;
    const progressPct = checkedCount > 0 ? Math.round((checkedCount / totalTasks) * 100) : null;

    const status = !assignment
      ? "unclaimed"
      : isMine && history
      ? "completed"
      : isMine
      ? "mine"
      : "other";

    return {
      dayKey,
      dayNumber,
      status,
      isPastOrToday: dayKey <= todayKey,
      isToday: dayKey === todayKey,
      assignedEmail: assignment?.cleaner_email ?? null,
      progressLabel,
      progressPct,
      completedAt: history?.completed_at ?? null,
      checklistHref: isMine ? `/dashboard/checklist?day=${dayKey}` : null,
      historyHref: history ? `/dashboard/history?day=${dayKey}` : null,
    };
  });

  const toastMessage =
    params.toast === "claimed"
      ? "Day claimed"
      : params.toast === "unclaimed"
      ? "Day unclaimed"
      : null;

  const monthControls = (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/dashboard?month=${shiftMonth(year, monthIndex, -1)}`}>
          <ChevronLeft size={14} />
          Prev
        </Link>
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link href={`/dashboard?month=${shiftMonth(year, monthIndex, 1)}`}>
          Next
          <ChevronRight size={14} />
        </Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/dashboard">
          <CalendarDays size={14} />
          Today
        </Link>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20 md:pb-0">
        <ActionToast message={toastMessage} type="success" />

        <PageHeader
          title="Calendar"
          description="Month view with assignment status, progress, and quick actions."
        />

        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6">
            <p className="text-lg font-medium text-zinc-900">{monthName}</p>
            {monthControls}
          </CardContent>
        </Card>

        {assignmentsError ? (
          <Card className="border-rose-200 bg-rose-50">
            <CardContent className="p-4 sm:p-6 text-sm text-rose-700">
              Could not load assignments. Ensure the `cleaning_assignments` table exists.
            </CardContent>
          </Card>
        ) : null}

        {!assignments && !assignmentsError ? (
          <CalendarGridSkeleton />
        ) : (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <CalendarGrid
                monthLabel={monthName}
                weekdayLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
                leadingBlankCount={firstWeekday}
                days={calendarDays}
                claimAction={claimDay}
                unclaimAction={unclaimDay}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
