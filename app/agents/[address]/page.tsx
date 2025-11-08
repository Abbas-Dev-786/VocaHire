async function getAgentData(address: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/jobs?agent=${address}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return data.jobs as any[];
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; bg: string }> = {
    pending: { color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    completed: { color: "text-green-700 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
    failed: { color: "text-red-700 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
    processing: { color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
      {status}
    </span>
  );
}

export default async function AgentDashboard({
  params,
}: {
  params: { address: string };
}) {
  const jobs = await getAgentData(params.address).catch(() => []);
  const earnings = jobs
    .filter((j) => j.status === "completed")
    .reduce((sum, j) => sum + (j.amountUSDC || 0), 0);
  const completedJobs = jobs.filter((j) => j.status === "completed").length;
  const pendingJobs = jobs.filter((j) => j.status === "pending" || j.status === "processing").length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">Agent Dashboard</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your voice agent performance and earnings
        </p>
      </div>

      <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Agent Address</p>
            <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
              {params.address}
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl">
            🎤
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{jobs.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{completedJobs}</p>
              {pendingJobs > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {pendingJobs} pending
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Earned</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{earnings.toFixed(2)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">USDC</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {jobs.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Job History
            </h2>
            {jobs.map((j, index) => (
              <div
                key={j.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Job #{j.id}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Amount:</span>{" "}
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {j.amountUSDC} USDC
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={j.status} />
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
              <span className="text-4xl">📋</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No jobs yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Jobs will appear here once clients hire your agent
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
