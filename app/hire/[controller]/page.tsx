// app/hire/[controller]/page.tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { createWalletClient, custom, WalletClient } from "viem";
import { arcChain, escrowAbi, erc20Abi, publicClient } from "@/lib/onchain"; // Assuming publicClient is exported from onchain

export default function Hire() {
  const params = useParams<{ controller: string }>();

  const [prompt, setPrompt] = useState("");
  const [amount, setAmount] = useState(5);
  const [mode, setMode] = useState<"escrow" | "circle">("escrow");
  const [resp, setResp] = useState<any>(null);

  // New state for wallet
  const [wallet, setWallet] = useState<{
    client: WalletClient;
    account: `0x${string}`;
  } | null>(null);

  // New function to connect wallet
  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    const [account] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const client = createWalletClient({
      account,
      chain: arcChain,
      transport: custom(window.ethereum),
    });

    setWallet({ client, account });
    setResp({ message: `Wallet connected: ${account}` });
  }

  async function openJob() {
    if (mode === "escrow" && !wallet) {
      alert("Please connect your wallet first for escrow mode.");
      return;
    }

    setResp({ message: "1/6: Creating job in database..." });
    // 1. Create the job in the backend to get all the data
    const r = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/jobs/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentController: `0x${params.controller.replace(/^0x/i, "")}`,
        amountUSDC: amount,
        clientAddr: wallet?.account || "0xCirclePayment", // Use wallet account if available
        paymentMode: mode,
        taskPrompt: prompt,
      }),
    });

    const apiResp = await r.json();
    if (!r.ok) {
      setResp({ error: "Failed to create job", details: apiResp });
      return;
    }
    setResp(apiResp); // Show the response from the API

    // 2. If mode is "escrow", proceed with on-chain funding
    if (apiResp.paymentMode === "escrow" && wallet) {
      try {
        const usdcAddress = apiResp.usdc as `0x${string}`;
        const escrowAddress = apiResp.escrow as `0x${string}`;
        const agentController = apiResp.agentController as `0x${string}`;
        const amountToFund = BigInt(apiResp.amount); // e.g., "5000000"

        // 3. Approve USDC spend
        setResp({ ...apiResp, message: "2/6: Waiting for USDC approval..." });
        const approveHash = await wallet.client.writeContract({
          address: usdcAddress,
          abi: erc20Abi, // Imported from lib/onchain.ts
          functionName: "approve",
          args: [escrowAddress, amountToFund],
          chain: arcChain,
          account: wallet.account, // <-- ADD THIS LINE
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        // 4. Simulate openJob to get the on-chain Job ID
        setResp({ ...apiResp, message: "3/6: Approving job on-chain..." });
        const { result: onchainJobId } = await publicClient.simulateContract({
          address: escrowAddress,
          abi: escrowAbi, // Imported from lib/onchain.ts
          functionName: "openJob",
          args: [agentController, amountToFund],
          account: wallet.account,
          chain: arcChain,
        });

        // 5. Execute openJob
        setResp({
          ...apiResp,
          message: "4/6: Submitting job to escrow...",
          onchainJobId,
        });
        const openJobHash = await wallet.client.writeContract({
          address: escrowAddress,
          abi: escrowAbi,
          functionName: "openJob",
          args: [agentController, amountToFund],
          chain: arcChain,
          account: wallet.account, // <-- ADD THIS LINE
        });
        await publicClient.waitForTransactionReceipt({ hash: openJobHash });

        // 6. Save the onchainJobId to our database
        setResp({
          ...apiResp,
          message: "5/6: Saving on-chain ID to database...",
        });
        await fetch("/api/jobs/set-onchain-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            databaseId: apiResp.jobId, // The CUID from the backend
            onchainId: onchainJobId.toString(), // The numeric ID from the contract
          }),
        });

        setResp({
          ...apiResp,
          message: "6/6: Job funded on-chain successfully!",
          onchainJobId: onchainJobId.toString(),
          txHash: openJobHash,
        });
      } catch (e: any) {
        setResp({ error: "On-chain transaction failed", details: e.message });
        console.error(e);
      }
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-5">
      <h1 className="text-2xl font-bold">Hire Voice Agent</h1>

      {/* New Connect Wallet Button */}
      {!wallet && (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 w-full"
        >
          Connect Wallet
        </button>
      )}

      {/* ... (rest of your form: prompt, amount, mode) ... */}

      <label className="block space-y-1">
        <span className="text-sm font-semibold">Phone number</span>
        <input
          value={prompt}
          type="tel"
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="enter phone number"
          className="border rounded p-2 w-full"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold">Budget (USDC)</span>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="border rounded p-2 w-full"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold">Payment Mode</span>
        <select
          className="border rounded p-2 w-full"
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
        >
          <option value="escrow">On-chain Escrow</option>
          <option value="circle">Circle Transfer</option>
        </select>
      </label>

      <button
        onClick={openJob}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        disabled={mode === "escrow" && !wallet} // Disable if escrow and no wallet
      >
        Open Job
      </button>

      {resp && (
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(
            resp,
            (key, value) =>
              typeof value === "bigint" ? value.toString() : value,
            2
          )}
        </pre>
      )}
    </main>
  );
}
