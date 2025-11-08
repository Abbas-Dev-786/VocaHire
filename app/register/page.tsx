"use client";
import { useState } from "react";

export default function RegisterAgent() {
  const [form, setForm] = useState({
    elevenlabsAgentId: "",
    metaURI: "",
    payoutAddress: "",
    ratePerCall: 1,
  });
  const [resp, setResp] = useState<any>(null);

  const register = async () => {
    const r = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/agents/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    setResp(await r.json());
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-5">
      <h1 className="text-2xl font-bold">Register New Voice Agent</h1>

      <label className="block space-y-1">
        <span className="text-sm font-semibold">ElevenLabs Agent ID</span>
        <input
          type="text"
          className="border rounded p-2 w-full"
          value={form.elevenlabsAgentId}
          onChange={(e) =>
            setForm({ ...form, elevenlabsAgentId: e.target.value })
          }
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold">Metadata URI</span>
        <input
          type="text"
          className="border rounded p-2 w-full"
          value={form.metaURI}
          onChange={(e) => setForm({ ...form, metaURI: e.target.value })}
          placeholder="https://example.com/metadata.json"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold">Payout Address (Arc)</span>
        <input
          type="text"
          className="border rounded p-2 w-full"
          value={form.payoutAddress}
          onChange={(e) => setForm({ ...form, payoutAddress: e.target.value })}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold">Rate per Call (USDC)</span>
        <input
          type="number"
          className="border rounded p-2 w-full"
          value={form.ratePerCall}
          onChange={(e) =>
            setForm({ ...form, ratePerCall: parseFloat(e.target.value) })
          }
        />
      </label>

      <button
        onClick={register}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Register Agent
      </button>

      {resp && (
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(resp, null, 2)}
        </pre>
      )}
    </main>
  );
}
