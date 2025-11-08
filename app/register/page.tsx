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
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">Register New Voice Agent</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Add your voice agent to the marketplace and start earning USDC
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg animate-fade-in">
        <div className="space-y-6">
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ElevenLabs Agent ID
            </span>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={form.elevenlabsAgentId}
              onChange={(e) =>
                setForm({ ...form, elevenlabsAgentId: e.target.value })
              }
              placeholder="Enter your ElevenLabs agent ID"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Agent Name
            </span>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={form.metaURI}
              onChange={(e) => setForm({ ...form, metaURI: e.target.value })}
              placeholder="Appointment Scheduler"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Payout Address (Arc)
            </span>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-sm"
              value={form.payoutAddress}
              onChange={(e) => setForm({ ...form, payoutAddress: e.target.value })}
              placeholder="0x..."
            />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Rate per Call (USDC)
            </span>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={form.ratePerCall}
                onChange={(e) =>
                  setForm({ ...form, ratePerCall: parseFloat(e.target.value) || 0 })
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                USDC
              </span>
            </div>
          </label>

          <button
            onClick={register}
            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Register Agent
          </button>
        </div>

        {resp && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 animate-slide-in">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Response:
            </h3>
            <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
              {JSON.stringify(resp, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
