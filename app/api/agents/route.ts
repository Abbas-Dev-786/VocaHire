import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const agents = await prisma.agent.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ agents });
}
