import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { EmailsTable } from "@/components/dashboard/emails-table";

export default async function EmailsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const emails = await prisma.email.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Serialize dates for client component
  const serialized = emails.map((e) => ({
    ...e,
    headers: undefined,
    queuedAt: e.queuedAt.toISOString(),
    sentAt: e.sentAt?.toISOString() ?? null,
    deliveredAt: e.deliveredAt?.toISOString() ?? null,
    failedAt: e.failedAt?.toISOString() ?? null,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Emails</h1>
        <p className="text-muted-foreground">
          Recent emails sent through the API.
        </p>
      </div>
      <EmailsTable emails={serialized} />
    </div>
  );
}
