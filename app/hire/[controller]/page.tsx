"use client";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function Hire() {
  const params = useParams<{ controller: string }>();

  const [prompt, setPrompt] = useState("");
  const [amount, setAmount] = useState(5);
  const [mode, setMode] = useState<"escrow" | "circle">("escrow");
  const [resp, setResp] = useState<any>(null);

  async function openJob() {
    const r = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/jobs/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentController: `0x${params.controller.replace(/^0x/i, "")}`,
        amountUSDC: amount,
        clientAddr: "0xYourClientAddress",
        paymentMode: mode,
        taskPrompt: prompt,
      }),
    });
    setResp(await r.json());
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-5">
      <h1 className="text-2xl font-bold">Hire Voice Agent</h1>

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
      >
        Open Job
      </button>

      {resp && (
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(resp, null, 2)}
        </pre>
      )}
    </main>
  );
}
