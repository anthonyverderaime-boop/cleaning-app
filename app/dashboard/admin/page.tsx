import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Plus, Save, Shield, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ActionToast from "../_components/ActionToast";
import AdminTabs from "../_components/AdminTabs";
import PageHeader from "../_components/PageHeader";

type ChecklistItem = {
  id: number;
  label: string;
  sort_order: number;
  is_active: boolean;
};

type WorkerRow = {
  user_id: string;
  cleaner_email: string | null;
};

async function getIsAdmin(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data?.user_id);
}

async function addChecklistItem(formData: FormData) {
  "use server";

  const label = formData.get("label");
  if (typeof label !== "string" || !label.trim()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await getIsAdmin(user.id))) return redirect("/dashboard");

  const { data: maxRow } = await supabase
    .from("cleaning_checklist_items")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("cleaning_checklist_items").insert({
    label: label.trim(),
    sort_order: (maxRow?.sort_order ?? 0) + 1,
    is_active: true,
  });

  revalidatePath("/dashboard/admin");
  redirect("/dashboard/admin?tab=checklist&toast=added");
}

async function updateChecklistItem(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  const labelRaw = formData.get("label");
  const label = typeof labelRaw === "string" ? labelRaw.trim() : "";
  if (!Number.isFinite(id) || !label) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await getIsAdmin(user.id))) return redirect("/dashboard");

  await supabase.from("cleaning_checklist_items").update({ label }).eq("id", id);
  revalidatePath("/dashboard/admin");
  redirect("/dashboard/admin?tab=checklist&toast=saved");
}

async function deleteChecklistItem(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await getIsAdmin(user.id))) return redirect("/dashboard");

  await supabase.from("cleaning_checklist_items").delete().eq("id", id);
  revalidatePath("/dashboard/admin");
  redirect("/dashboard/admin?tab=checklist&toast=deleted");
}

type AdminPageProps = {
  searchParams: Promise<{ tab?: string; toast?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isAdmin = await getIsAdmin(user.id);
  if (!isAdmin) redirect("/dashboard");

  const tab = params.tab === "workers" || params.tab === "buildings" ? params.tab : "checklist";

  const { data: checklistItems } = await supabase
    .from("cleaning_checklist_items")
    .select("id,label,sort_order,is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<ChecklistItem[]>();

  const { data: assignmentRows } = await supabase
    .from("cleaning_assignments")
    .select("user_id,cleaner_email")
    .returns<WorkerRow[]>();

  const workers = Object.values(
    (assignmentRows ?? []).reduce<Record<string, WorkerRow>>((acc, row) => {
      if (!acc[row.user_id]) acc[row.user_id] = row;
      return acc;
    }, {})
  );

  const toastMessage =
    params.toast === "added"
      ? "Checklist item added"
      : params.toast === "saved"
      ? "Checklist item saved"
      : params.toast === "deleted"
      ? "Checklist item deleted"
      : null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20 md:pb-0">
        <ActionToast message={toastMessage} type="success" />

        <PageHeader title="Admin" description="Manage templates and worker-level settings." actions={<Shield size={18} className="text-zinc-500" />} />

        <AdminTabs value={tab} />

        {tab === "checklist" ? (
          <Card>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <form action={addChecklistItem} className="flex flex-wrap gap-2">
                <Input name="label" placeholder="Add checklist item" className="min-w-72" required />
                <Button type="submit">
                  <Plus size={14} />
                  Add item
                </Button>
              </form>

              <div className="space-y-2">
                {(checklistItems ?? []).map((item) => (
                  <div key={item.id} className="rounded-lg border border-zinc-200 p-3">
                    <form action={updateChecklistItem} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={item.id} />
                      <Input name="label" defaultValue={item.label} className="min-w-72" required />
                      <Button type="submit" variant="outline">
                        <Save size={14} />
                        Save
                      </Button>
                    </form>
                    <form action={deleteChecklistItem} className="mt-2">
                      <input type="hidden" name="id" value={item.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        <Trash2 size={12} />
                        Delete
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {tab === "workers" ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers.map((worker) => (
                    <TableRow key={worker.user_id}>
                      <TableCell>{worker.cleaner_email ?? worker.user_id}</TableCell>
                      <TableCell>Worker</TableCell>
                      <TableCell>Enabled</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}

        {tab === "buildings" ? (
          <Card>
            <CardContent className="space-y-2 p-4 sm:p-6">
              <p className="text-lg font-medium text-zinc-900">Buildings</p>
              <p className="text-sm text-zinc-600">
                Placeholder panel. Connect to a `buildings` table when that model is introduced.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
