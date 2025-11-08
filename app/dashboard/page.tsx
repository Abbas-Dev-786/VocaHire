async function getJobs() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/jobs`, {
    cache: "no-store",
  });
  const data = await res.json();
  return data.jobs as any[];
}

export default async function Dashboard() {
  const jobs = await getJobs().catch(() => []);
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">📈 Your Jobs</h1>
      <div className="space-y-3">
        {jobs.map((j) => (
          <div key={j.id} className="border rounded p-4 bg-white">
            <div className="font-semibold">Job #{j.id}</div>
            <div>
              Status: <span className="font-mono">{j.status}</span>
            </div>
            <div>Agent: {j.agentId}</div>
            <div>Amount: {j.amountUSDC} USDC</div>
            {j.txHash && (
              <a
                href={`https://arc-explorer.circle.com/tx/${j.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="underline text-blue-600"
              >
                View on Arc Explorer
              </a>
            )}
          </div>
        ))}
      </div>
      {jobs.length === 0 && <p className="text-gray-400">No jobs yet.</p>}
    </main>
  );
}
