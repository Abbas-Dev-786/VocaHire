import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyElevenLabsSignature } from "@/lib/verify";
import { ESCROW_ADDRESS, relayer, escrowAbi, arcChain } from "@/lib/onchain";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (
    !verifyElevenLabsSignature(raw, req.headers.get("x-elevenlabs-signature"))
  )
    return new NextResponse("invalid signature", { status: 401 });

  const { jobId, status, callId } = JSON.parse(raw);
  if (status !== "completed")
    return NextResponse.json({ ok: true, skipped: true });

  // For escrow, jobId must correspond to on-chain job (align your UI flow).
  // If you store numeric onchainJobId separately, use that here.
  const onchainJobId = Number(jobId);

  const hash = await relayer.writeContract({
    address: ESCROW_ADDRESS,
    abi: escrowAbi,
    functionName: "markCompleted",
    args: [BigInt(onchainJobId)],
    chain: arcChain,
  });

  await prisma.job.update({
    where: { id: String(jobId) },
    data: { status: "completed", callId, txHash: String(hash) },
  });

  return NextResponse.json({ ok: true, tx: String(hash) });
}
