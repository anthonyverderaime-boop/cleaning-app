import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type CheckEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const { email } = await searchParams;

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Card className="max-w-xl">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Check your email</h1>
            <p className="text-sm text-zinc-600">
              We created your account.
              {email ? ` A confirmation link was sent to ${email}.` : " A confirmation link was sent to your email address."}
            </p>
            <p className="text-sm text-zinc-600">
              Open the link in that email to activate your account, then return here to sign in.
            </p>
            <Button asChild variant="outline">
              <Link href="/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
