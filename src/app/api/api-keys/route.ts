import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const key = `re_${crypto.randomBytes(24).toString("base64url")}`;

  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      key,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ id: apiKey.id, name: apiKey.name, key });
}
