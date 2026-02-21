import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function Page() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Cleaning Scheduler</h1>
              <p className="text-sm text-zinc-600">Plan days, run checklists, and track completed cleans.</p>
            </div>
            <nav className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </nav>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
