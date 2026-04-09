import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Delivr</h1>
        <p className="text-lg text-muted-foreground">Email API for developers</p>
      </div>
      <div className="flex gap-3">
        <Link href="/sign-in" className={buttonVariants()}>
          Sign in
        </Link>
        <Link href="/sign-up" className={buttonVariants({ variant: "outline" })}>
          Get started
        </Link>
      </div>
    </div>
  );
}
