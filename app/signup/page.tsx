"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName.trim() || undefined,
        },
      },
    });
    if (error) return setError(error.message);

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    const params = new URLSearchParams({ email });
    router.push(`/auth/check-email?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Card className="max-w-md">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Create account</h1>
              <p className="text-sm text-zinc-600">Set up your account to access the cleaning dashboard.</p>
            </div>

            <form className="space-y-4" onSubmit={signUp}>
              <Input
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              {error ? (
                <p className="rounded-md border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{error}</p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button type="submit">Create account</Button>
                <Button asChild type="button" variant="outline">
                  <Link href="/login">Back to sign in</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
