"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  CalendarDays,
  ClipboardList,
  History,
  LogOut,
  ShieldCheck,
  User2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/checklist", label: "Checklist", icon: ClipboardList },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
];

const routeMeta: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Calendar",
    description: "Claim days, view assignments, and manage daily cleaning ownership.",
  },
  "/dashboard/checklist": {
    title: "Checklist",
    description: "Run tasks for your assigned day and track completion progress.",
  },
  "/dashboard/history": {
    title: "History",
    description: "Review completed cleaning runs and filter records.",
  },
  "/dashboard/admin": {
    title: "Admin",
    description: "Manage templates and team-level configuration.",
  },
};

function getHeaderMeta(pathname: string) {
  if (pathname.startsWith("/dashboard/admin")) return routeMeta["/dashboard/admin"];
  if (pathname.startsWith("/dashboard/history")) return routeMeta["/dashboard/history"];
  if (pathname.startsWith("/dashboard/checklist")) return routeMeta["/dashboard/checklist"];
  return routeMeta["/dashboard"];
}

export default function AppShell({
  children,
  userEmail,
  displayName,
  isAdmin,
  signOutAction,
  saveDisplayNameAction,
}: {
  children: React.ReactNode;
  userEmail: string;
  displayName: string;
  isAdmin: boolean;
  signOutAction: () => Promise<void>;
  saveDisplayNameAction: (formData: FormData) => Promise<void>;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const meta = getHeaderMeta(pathname);
  const shellToast = searchParams.get("shellToast");
  const currentParams = new URLSearchParams(searchParams.toString());
  currentParams.delete("shellToast");
  const redirectTo = currentParams.toString() ? `${pathname}?${currentParams.toString()}` : pathname;

  useEffect(() => {
    if (shellToast === "name-saved") {
      toast.success("Display name saved");
    }
    if (shellToast === "name-error") {
      toast.error("Could not save display name");
    }
  }, [shellToast]);

  const initials = displayName
    .replace(/@.*$/, "")
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" className="border-r border-zinc-200 bg-white">
        <SidebarHeader className="px-4 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Cleaning Scheduler</p>
          <h2 className="text-lg font-medium text-zinc-900">Team Workspace</h2>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarMenu>
            {navItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm hover:bg-zinc-100",
                      active && "bg-white border border-zinc-200 shadow-sm"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon size={16} className="text-zinc-500" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="px-3 pb-4">
          <Badge variant="outline" className="justify-center">
            {isAdmin ? "Admin" : "Worker"}
          </Badge>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-zinc-50">
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
          <div className="flex items-start justify-between gap-4 px-4 sm:px-6 py-4">
            <div className="flex items-start gap-3">
              <SidebarTrigger className="mt-0.5 border border-zinc-200 bg-white hover:bg-zinc-100" />
              <div className="space-y-1">
                <p className="text-3xl font-semibold tracking-tight text-zinc-900">{meta.title}</p>
                <p className="text-sm text-zinc-600">{meta.description}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 gap-2 px-2">
                  <Avatar initials={initials || "U"} className="h-6 w-6 text-[10px]" />
                  <span className="hidden max-w-[180px] truncate text-sm sm:block">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="pointer-events-none text-xs text-zinc-500">
                  <User2 size={12} />
                  {displayName}
                </DropdownMenuItem>
                <div className="space-y-2 p-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Display name</p>
                  <form action={saveDisplayNameAction} className="space-y-2">
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <Input name="display_name" defaultValue={displayName} placeholder="Your name" />
                    <Button type="submit" size="sm" className="w-full">
                      Save name
                    </Button>
                  </form>
                  <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
                </div>
                <DropdownMenuItem>
                  <form action={signOutAction} className="w-full">
                    <Button variant="outline" size="sm" className="w-full justify-start" type="submit">
                      <LogOut size={14} />
                      Sign out
                    </Button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Badge variant="outline">{isAdmin ? "Admin" : "Worker"}</Badge>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
