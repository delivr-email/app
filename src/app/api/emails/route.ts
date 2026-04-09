import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { emailQueue } from "@/lib/queue";
import { sendEmailSchema } from "@/lib/validation";
import { createEmailId } from "@/lib/email-id";

async function authenticateApiKey(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const key = authHeader.slice(7);
  const apiKey = await prisma.apiKey.findUnique({ where: { key } });
  return apiKey;
}

export async function POST(request: NextRequest) {
  const apiKey = await authenticateApiKey(request);
  if (!apiKey) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const result = sendEmailSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 422 }
    );
  }

  const data = result.data;
  const id = createEmailId();

  await prisma.email.create({
    data: {
      id,
      fromAddress: data.from,
      toAddresses: data.to,
      subject: data.subject,
      html: data.html,
      textContent: data.text,
      replyTo: data.replyTo,
      cc: data.cc ?? [],
      bcc: data.bcc ?? [],
      headers: data.headers,
      status: "queued",
      userId: apiKey.userId,
    },
  });

  await emailQueue.add("send-email", {
    emailId: id,
    from: data.from,
    to: data.to,
    subject: data.subject,
    html: data.html,
    text: data.text,
    replyTo: data.replyTo,
    cc: data.cc,
    bcc: data.bcc,
    headers: data.headers,
  });

  return NextResponse.json({ id, status: "queued" }, { status: 201 });
}
