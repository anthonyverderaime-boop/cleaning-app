import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import AppShell from "./_components/AppShell";
import { createClient } from "@/utils/supabase/server";
import { getDisplayName } from "@/utils/user/displayName";

async function getIsAdmin(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data?.user_id);
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isAdmin = await getIsAdmin(user.id);
  const displayName = getDisplayName(user);

  async function signOut() {
    "use server";
    const server = await createClient();
    await server.auth.signOut();
    redirect("/login");
  }

  async function saveDisplayName(formData: FormData) {
    "use server";

    const nextNameRaw = formData.get("display_name");
    const redirectTarget = formData.get("redirect_to");
    const redirectTo =
      typeof redirectTarget === "string" && redirectTarget.startsWith("/dashboard")
        ? redirectTarget
        : "/dashboard";
    const nextName = typeof nextNameRaw === "string" ? nextNameRaw.trim() : "";
    const appendToast = (path: string, toast: string) => {
      const separator = path.includes("?") ? "&" : "?";
      return `${path}${separator}shellToast=${toast}`;
    };

    if (!nextName) return redirect(appendToast(redirectTo, "name-error"));

    const server = await createClient();
    const {
      data: { user: currentUser },
    } = await server.auth.getUser();
    if (!currentUser) return redirect("/login");

    const { error } = await server.auth.updateUser({
      data: { display_name: nextName },
    });
    if (error) return redirect(appendToast(redirectTo, "name-error"));

    await server.from("cleaning_assignments").update({ cleaner_email: nextName }).eq("user_id", currentUser.id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/checklist");
    revalidatePath("/dashboard/history");
    revalidatePath("/dashboard/admin");
    redirect(appendToast(redirectTo, "name-saved"));
  }

  return (
    <AppShell
      userEmail={user.email ?? "unknown@user"}
      displayName={displayName}
      isAdmin={isAdmin}
      signOutAction={signOut}
      saveDisplayNameAction={saveDisplayName}
    >
      {children}
    </AppShell>
  );
}
