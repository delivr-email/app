import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const email = await prisma.email.findUnique({
    where: { id },
  });

  if (!email) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: email.id,
    from: email.fromAddress,
    to: email.toAddresses,
    subject: email.subject,
    status: email.status,
    queuedAt: email.queuedAt.toISOString(),
    sentAt: email.sentAt?.toISOString() ?? null,
    deliveredAt: email.deliveredAt?.toISOString() ?? null,
    failedAt: email.failedAt?.toISOString() ?? null,
    errorMessage: email.errorMessage,
    createdAt: email.createdAt.toISOString(),
  });
}
