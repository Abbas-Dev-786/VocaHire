import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyElevenLabsSignature } from "@/lib/verify";
import { transferUSDC } from "@/lib/circle";
import { uid } from "uid";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (
    !verifyElevenLabsSignature(raw, req.headers.get("x-elevenlabs-signature"))
  )
    return new NextResponse("invalid signature", { status: 401 });

  const { jobId, status } = JSON.parse(raw);
  if (status !== "completed")
    return NextResponse.json({ ok: true, skipped: true });

  const job = await prisma.job.findUnique({ where: { id: String(jobId) } });
  if (!job) return new NextResponse("job not found", { status: 404 });

  const agent = await prisma.agent.findUnique({
    where: { payoutAddress: job.agentId },
  });
  if (!agent) return new NextResponse("agent not found", { status: 404 });

  const res = await transferUSDC(
    uid(),
    process.env.CIRCLE_SOURCE_WALLET_ID!,
    agent.payoutAddress,
    job.amountUSDC.toFixed(2), // Circle's money object
    process.env.USDC_ADDRESS!
  );

  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "completed",
      circleTransferId: res?.data?.id ?? res?.data?.transfer?.id,
    },
  });

  return NextResponse.json({
    ok: true,
    transferId: res?.data?.id ?? res?.data?.transfer?.id,
  });
}
