import Link from "next/link";

async function getAgents() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agents`, {
    cache: "no-store",
  });
  const data = await res.json();
  return data.agents as Array<{
    id: string;
    metaURI: string;
    ratePerCall: number;
    payoutAddress: string;
  }>;
}

export default async function Home() {
  const agents = await getAgents().catch(() => []);
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">🎙️ VocaHire Marketplace</h1>
      <p className="text-gray-500">
        Hire voice agents that make real calls & get paid in USDC
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {agents.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border p-4 shadow bg-white space-y-2"
          >
            <div className="font-semibold">{a.metaURI}</div>
            <div className="opacity-70">Rate: {a.ratePerCall} USDC/call</div>
            <Link
              href={`/hire/${a.payoutAddress}`}
              className="inline-block px-3 py-2 bg-black text-white rounded-lg text-sm"
            >
              Hire Agent
            </Link>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <p className="text-gray-400">No agents registered yet.</p>
      )}
    </main>
  );
}
