import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const ARC_RPC_URL = process.env.ARC_RPC_URL!;
export const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS as `0x${string}`;
export const ESCROW_ADDRESS = process.env.ESCROW_ADDRESS as `0x${string}`;
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY!;

export const registryAbi = [
  {
    type: "function",
    name: "upsertAgent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentController", type: "address" },
      { name: "payout", type: "address" },
      { name: "metaURI", type: "string" },
      { name: "active", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getPayout",
    stateMutability: "view",
    inputs: [{ name: "agentController", type: "address" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "isActive",
    stateMutability: "view",
    inputs: [{ name: "agentController", type: "address" }],
    outputs: [{ type: "bool" }],
  },
] as const;

export const escrowAbi = [
  {
    type: "function",
    name: "openJob",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentController", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "markCompleted",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

export const publicClient = createPublicClient({
  transport: http(ARC_RPC_URL),
});

export const relayer = createWalletClient({
  account: privateKeyToAccount(RELAYER_PRIVATE_KEY as `0x${string}`),
  transport: http(ARC_RPC_URL),
});

export const arcChain = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: { default: { http: [process.env.ARC_RPC_URL!] } },
});

export const toUSDC = (n: number | string) => parseUnits(String(n), 6);
