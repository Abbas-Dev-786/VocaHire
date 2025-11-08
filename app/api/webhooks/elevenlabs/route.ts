// app/api/webhooks/elevenlabs/route.ts
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

  // 1. Find the job in the database using the database ID (CUID) from the webhook
  const job = await prisma.job.findUnique({
    where: { id: String(jobId) }, // jobId from webhook is the CUID
  });

  if (!job) {
    return new NextResponse("Job not found", { status: 404 });
  }

  // 2. Check if it has an onchainJobId. If not, it was likely a Circle payment.
  if (!job.onchainJobId) {
    console.log(
      `Job ${jobId} completed but has no onchainJobId, skipping escrow. (Was it a Circle payment?)`
    );
    return NextResponse.json({ ok: true, skipped: "no_onchain_id" });
  }

  // 3. Use the onchainJobId (which is a number) for the smart contract
  const onchainJobId = job.onchainJobId;

  const hash = await relayer.writeContract({
    address: ESCROW_ADDRESS,
    abi: escrowAbi,
    functionName: "markCompleted",
    args: [BigInt(onchainJobId)], // Use the ID from the database
    chain: arcChain,
  });

  await prisma.job.update({
    where: { id: String(jobId) }, // Update by CUID
    data: { status: "completed", callId, txHash: String(hash) },
  });

  return NextResponse.json({ ok: true, tx: String(hash) });
}
