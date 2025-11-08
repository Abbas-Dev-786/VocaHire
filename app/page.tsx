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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-bold mb-4">
          <span className="gradient-text">VocaHire</span> Marketplace
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Hire intelligent voice agents that make real calls & get paid in USDC. 
          Connect with AI-powered assistants for your business needs.
        </p>
      </div>

      {agents.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((a, index) => (
            <div
              key={a.id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl">
                🎙️
              </div>
              
              <div className="mt-2 mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {a.metaURI}
                </h3>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <span className="text-sm">Rate:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {a.ratePerCall} USDC/call
                  </span>
                </div>
              </div>

              <Link
                href={`/hire/${a.payoutAddress}`}
                className="block w-full mt-6 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-center hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Hire Agent →
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
            <span className="text-4xl">🎤</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No agents available yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Be the first to register a voice agent on the marketplace!
          </p>
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Register Your Agent
          </Link>
        </div>
      )}
    </main>
  );
}
