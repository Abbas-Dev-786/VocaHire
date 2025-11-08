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
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">Hire Voice Agent</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new job and let the agent handle your call
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg animate-fade-in">
        {/* Wallet Connection */}
        {!wallet && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
              {mode === "escrow" 
                ? "Connect your wallet to use on-chain escrow payment" 
                : "Optional: Connect wallet for on-chain escrow mode"}
            </p>
            <button
              onClick={connectWallet}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              🔗 Connect Wallet
            </button>
          </div>
        )}

        {wallet && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                  Wallet Connected
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 font-mono mt-1">
                  {wallet.account.slice(0, 6)}...{wallet.account.slice(-4)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </span>
            <input
              value={prompt}
              type="tel"
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Budget (USDC)
            </span>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                USDC
              </span>
            </div>
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Payment Mode
            </span>
            <select
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
            >
              <option value="escrow">On-chain Escrow</option>
              <option value="circle">Circle Transfer</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {mode === "escrow" 
                ? "Funds are held in escrow until job completion" 
                : "Direct transfer via Circle payment"}
            </p>
          </label>

          <button
            onClick={openJob}
            disabled={mode === "escrow" && !wallet}
            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {resp?.message ? resp.message : "Open Job"}
          </button>
        </div>

        {resp && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 animate-slide-in">
            {resp.error ? (
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                  Error:
                </h3>
                <p className="text-xs text-red-600 dark:text-red-400">{resp.error}</p>
              </div>
            ) : resp.message ? (
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                  Status:
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{resp.message}</p>
              </div>
            ) : null}
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Response Details:
            </h3>
            <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
              {JSON.stringify(
                resp,
                (key, value) =>
                  typeof value === "bigint" ? value.toString() : value,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
