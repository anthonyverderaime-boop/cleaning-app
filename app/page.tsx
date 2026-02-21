import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page() {
  const supabase = await createClient();

  const { data: todos, error } = await supabase
    .from("todos")
    .select("*")
    .limit(50)
    .returns<Record<string, unknown>[]>();

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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Todos (debug list)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                <p className="font-medium text-rose-700">Supabase error</p>
                <pre className="mt-2 whitespace-pre-wrap text-sm text-rose-700">{error.message}</pre>
              </div>
            ) : null}

            {!error && (!todos || todos.length === 0) ? (
              <p className="text-sm text-zinc-600">No todos yet (or the table does not exist).</p>
            ) : null}

            {!error && todos && todos.length > 0 ? (
              <ul className="space-y-3">
                {todos.map((todo, index) => {
                  const id = todo.id;
                  const key = typeof id === "string" || typeof id === "number" ? id : `todo-${index}`;

                  return (
                    <li key={key} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                      <pre className="text-sm whitespace-pre-wrap text-zinc-700">{JSON.stringify(todo, null, 2)}</pre>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
