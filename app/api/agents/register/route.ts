import { NextRequest, NextResponse } from "next/server";
import { createWallet } from "@/lib/circle";
import {
  relayer,
  REGISTRY_ADDRESS,
  registryAbi,
  arcChain,
} from "@/lib/onchain";
import { uid } from "uid";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { elevenlabsAgentId, metaURI, payoutAddress, ratePerCall } =
    await req.json();

  // 1) Circle wallet
  const cw = await createWallet(uid());
  const circleWalletId = cw?.id as string;

  // 2) On-chain registry (owner-only). Here relayer must be the registry owner.
  await relayer.writeContract({
    address: REGISTRY_ADDRESS,
    abi: registryAbi,
    functionName: "upsertAgent",
    args: [payoutAddress, payoutAddress, metaURI, true],
    chain: arcChain,
  });

  // 3) DB
  const agent = await prisma.agent.create({
    data: {
      elevenlabsId: elevenlabsAgentId,
      circleWalletId,
      payoutAddress,
      metaURI,
      ratePerCall,
    },
  });

  return NextResponse.json({
    circleWalletId,
    payoutAddress,
    status: "registered",
    agentId: agent.id,
  });
}
