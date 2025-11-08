// app/api/jobs/set-onchain-id/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { databaseId, onchainId } = await req.json();

    if (!databaseId || !onchainId) {
      throw new Error("Missing databaseId or onchainId");
    }

    const job = await prisma.job.update({
      where: { id: String(databaseId) },
      data: {
        onchainJobId: Number(onchainId), // Store the numeric on-chain ID
      },
    });

    return NextResponse.json({ ok: true, job });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
