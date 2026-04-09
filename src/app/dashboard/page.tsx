import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getStats(userId: string) {
  const [total, sent, failed, queued] = await Promise.all([
    prisma.email.count({ where: { userId } }),
    prisma.email.count({ where: { userId, status: "sent" } }),
    prisma.email.count({ where: { userId, status: "failed" } }),
    prisma.email.count({ where: { userId, status: "queued" } }),
  ]);

  return { total, sent, failed, queued };
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const stats = await getStats(session!.user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Your email sending activity at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Emails" value={stats.total} />
        <StatCard title="Sent" value={stats.sent} />
        <StatCard title="Failed" value={stats.failed} />
        <StatCard title="Queued" value={stats.queued} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}
