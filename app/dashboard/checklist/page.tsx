import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CalendarCheck2, CalendarDays } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { buildChecklistForDay } from "@/utils/checklist/daySpecific";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ActionToast from "../_components/ActionToast";
import ChecklistRunner from "../_components/ChecklistRunner";
import EmptyState from "../_components/EmptyState";
import PageHeader from "../_components/PageHeader";

type ChecklistItem = {
  label: string;
};

type Assignment = {
  day: string;
};

type HistoryRow = {
  checked_items: string[] | null;
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

async function saveChecklist(formData: FormData) {
  "use server";

  const day = formData.get("day");
  if (typeof day !== "string") return;

  const intent = formData.get("intent");
  const checkedItems = formData.getAll("checked").filter((value): value is string => typeof value === "string");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const { data: claimedDay } = await supabase
    .from("cleaning_assignments")
    .select("day")
    .eq("day", day)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!claimedDay) return redirect("/dashboard/checklist?toast=not-assigned");

  await supabase.from("cleaning_history").upsert(
    {
      day,
      user_id: user.id,
      checked_items: checkedItems,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "day,user_id" }
  );

  revalidatePath("/dashboard/checklist");
  revalidatePath("/dashboard/history");

  if (intent === "complete") {
    return redirect(`/dashboard/checklist?day=${day}&toast=completed`);
  }

  return redirect(`/dashboard/checklist?day=${day}&toast=saved`);
}

type ChecklistPageProps = {
  searchParams: Promise<{ day?: string; toast?: string }>;
};

export default async function ChecklistPage({ searchParams }: ChecklistPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: assignments } = await supabase
    .from("cleaning_assignments")
    .select("day")
    .eq("user_id", user.id)
    .order("day", { ascending: true })
    .returns<Assignment[]>();

  const claimedDays = (assignments ?? []).map((assignment) => assignment.day);
  const selectedDay = params.day && claimedDays.includes(params.day) ? params.day : claimedDays[0];

  const { data: checklistItems } = await supabase
    .from("cleaning_checklist_items")
    .select("label")
    .eq("is_active", true)
    .returns<ChecklistItem[]>();

  const baseItems =
    checklistItems && checklistItems.length > 0
      ? checklistItems.map((item) => item.label)
      : fallbackChecklistItems;

  const items = selectedDay ? buildChecklistForDay(selectedDay, baseItems) : [];

  const { data: historyRow } = selectedDay
    ? await supabase
        .from("cleaning_history")
        .select("checked_items")
        .eq("day", selectedDay)
        .eq("user_id", user.id)
        .maybeSingle()
        .returns<HistoryRow>()
    : { data: null };

  const initialCheckedItems = historyRow?.checked_items ?? [];

  const toastMessage =
    params.toast === "saved"
      ? "Progress saved"
      : params.toast === "completed"
      ? "Cleaning marked complete"
      : params.toast === "not-assigned"
      ? "You can only save checklists for your claimed days"
      : null;
  const toastType = params.toast === "not-assigned" ? "error" : "success";

  const actions = selectedDay ? (
    <Badge className="bg-sky-50 text-sky-700 border-sky-200">
      <CalendarCheck2 size={12} />
      {selectedDay}
    </Badge>
  ) : undefined;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20 md:pb-0">
        <ActionToast message={toastMessage} type={toastType} />

        <PageHeader
          title="Checklist"
          description="Run tasks for the selected claimed day and record completion."
          actions={actions}
        />

        {claimedDays.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No claimed days yet"
            description="Claim one from the calendar to start checklist work."
            action={
              <Button asChild>
                <Link href="/dashboard">Go to calendar</Link>
              </Button>
            }
          />
        ) : (
          <>
            <Card>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <p className="text-lg font-medium text-zinc-900">Select day</p>
                <div className="flex flex-wrap gap-2">
                  {claimedDays.map((day) => {
                    const selected = day === selectedDay;
                    return (
                      <Button key={day} asChild variant={selected ? "default" : "outline"}>
                        <Link href={`/dashboard/checklist?day=${day}`}>
                          {day}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {selectedDay ? (
              <ChecklistRunner day={selectedDay} items={items} initialCheckedItems={initialCheckedItems} saveAction={saveChecklist} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
