async function getAgentData(address: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/jobs?agent=${address}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return data.jobs as any[];
}

export default async function AgentDashboard({
  params,
}: {
  params: { address: string };
}) {
  const jobs = await getAgentData(params.address).catch(() => []);
  const earnings = jobs
    .filter((j) => j.status === "completed")
    .reduce((sum, j) => sum + j.amountUSDC, 0);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">🎤 Agent Dashboard</h1>
      <div className="bg-white p-4 rounded border">
        <p className="font-semibold">Agent: {params.address}</p>
        <p>
          Total Completed Jobs:{" "}
          {jobs.filter((j) => j.status === "completed").length}
        </p>
        <p>Total Earned: {earnings} USDC</p>
      </div>

      <div className="space-y-3">
        {jobs.map((j) => (
          <div key={j.id} className="border rounded p-4 bg-white">
            <div>Job #{j.id}</div>
            <div>Status: {j.status}</div>
            <div>Amount: {j.amountUSDC} USDC</div>
          </div>
        ))}
      </div>
    </main>
  );
}
