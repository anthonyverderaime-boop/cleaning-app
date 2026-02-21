"use client";

import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import { Building2, ClipboardList, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AdminTab = "checklist" | "workers" | "buildings";

const tabs: Array<{ value: AdminTab; label: string; icon: ComponentType<{ size?: number; className?: string }> }> = [
  { value: "checklist", label: "Checklist Template", icon: ClipboardList },
  { value: "workers", label: "Workers", icon: Users },
  { value: "buildings", label: "Buildings", icon: Building2 },
];

export default function AdminTabs({ value }: { value: AdminTab }) {
  const router = useRouter();

  function onValueChange(next: string) {
    if (next !== "checklist" && next !== "workers" && next !== "buildings") return;
    router.push(`/dashboard/admin?tab=${next}`);
  }

  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger key={tab.value} value={tab.value}>
              <Icon size={14} className="text-zinc-500" />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
