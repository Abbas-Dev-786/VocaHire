import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

const CIRCLE_BASE_URL = process.env.CIRCLE_BASE_URL!;
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY!;
const CIRCLE_ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET!;

const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
  apiKey: CIRCLE_API_KEY,
  entitySecret: CIRCLE_ENTITY_SECRET,
});

export async function createWallet(idempotencyKey: string) {
  const response = await circleDeveloperSdk.createWallets({
    accountType: "SCA",
    blockchains: ["ARC-TESTNET"],
    count: 1,
    walletSetId: "e702a96b-b321-5d04-b234-6983f3687c92",
  });

  return response?.data?.wallets?.[0];
}

export async function transferUSDC(
  idempotencyKey: string,
  sourceWalletId: string,
  destinationAddress: string,
  amount: string,
  tokenAddress: string
) {
  const res = await fetch(`${CIRCLE_BASE_URL}/transfers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CIRCLE_API_KEY}`,
    },
    body: JSON.stringify({
      idempotencyKey,
      source: { type: "wallet", id: sourceWalletId },
      destination: {
        type: "blockchain",
        address: destinationAddress,
        chain: "ARC",
      },
      amount: { amount, currency: "USD" },
      token: tokenAddress,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Circle transfer failed: ${res.status}`);
  return res.json();
}
