import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agent = searchParams.get("agent");

  const where = agent ? { agentId: agent } : {};
  const jobs = await prisma.job.findMany({
    where,
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}
