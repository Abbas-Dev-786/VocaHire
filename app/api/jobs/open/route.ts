import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createVoiceCall } from "@/lib/elevenlabs";
import { ESCROW_ADDRESS } from "@/lib/onchain";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { agentController, amountUSDC, clientAddr, paymentMode, taskPrompt } =
      await req.json();

    // 1) Create job
    const job = await prisma.job.create({
      data: {
        agentId: agentController,
        amountUSDC,
        clientAddr,
        status: "open",
      },
    });

    // 2) Resolve agent by controller address
    const agent = await prisma.agent.findUnique({
      where: { payoutAddress: agentController },
    });
    if (!agent) throw new Error("Agent not found");

    // 3) Trigger ElevenLabs call
    const call = await createVoiceCall({
      agent_id: agent.elevenlabsId,
      agent_phone_number_id: "phnum_9101k3n1v1cbfk3r7myrhms5f8ap",
      to_number: taskPrompt,
      // prompt:
      //   taskPrompt || "Make the scheduled call and report back via webhook.",
      // metadata: { jobId: job.id, paymentMode },
    });
    console.log(call);
    const callId = call?.conversation_id;

    await prisma.job.update({ where: { id: job.id }, data: { callId } });

    // 4) Return details for client (approve+open on-chain if escrow)
    return NextResponse.json({
      usdc: process.env.USDC_ADDRESS,
      escrow: ESCROW_ADDRESS,
      agentController,
      amount: Math.round(amountUSDC * 1e6).toString(),
      jobId: job.id,
      paymentMode,
      callId,
      elevenlabsStatus: call?.status,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
