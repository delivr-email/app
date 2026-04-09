import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { CreateApiKeyForm } from "@/components/dashboard/create-api-key-form";
import { ApiKeyList } from "@/components/dashboard/api-key-list";

export default async function ApiKeysPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys for sending emails.
          </p>
        </div>
        <CreateApiKeyForm />
      </div>
      <ApiKeyList apiKeys={apiKeys} />
    </div>
  );
}
