
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminControls from '@/components/AdminControls';
import DeleteLLMButton from '@/components/DeleteLLMButton';
import Link from 'next/link';

export default async function AdminPage() {
    const session = await auth();
    if (!session) {
        redirect('/auth/signin');
    }

    const llms = await prisma.lLM.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <main className="min-h-screen p-8 md:p-24 bg-zinc-950 text-white">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                        <p className="text-zinc-400">Manage LLMs and Evaluations</p>
                    </div>
                    <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors">
                        &larr; Back to Leaderboard
                    </Link>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-1">
                        <AdminControls />
                    </div>

                    {/* Right Column: Status List */}
                    <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
                        <h2 className="text-2xl font-bold mb-6">Recent Evaluations</h2>
                        <div className="space-y-4">
                            {llms.length === 0 ? (
                                <p className="text-zinc-500">No evaluations found.</p>
                            ) : (
                                llms.map((llm) => (
                                    <div key={llm.id} className="bg-white/5 p-4 rounded-xl flex justify-between items-center">
                                        <div>
                                            <h3 className="font-semibold">
                                                {llm.name}
                                                {llm.reasoningEffort && llm.reasoningEffort !== 'default' && <span className="text-zinc-500 text-xs ml-2 normal-case border border-zinc-700 rounded px-1">{llm.reasoningEffort}</span>}
                                            </h3>
                                            <p className="text-xs text-zinc-500 font-mono">{llm.modelId}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${llm.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                                    llm.status === 'RUNNING' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                                                        llm.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-zinc-500/20 text-zinc-400'
                                                    }`}>
                                                    {llm.status}
                                                </span>
                                                <DeleteLLMButton id={llm.id} name={llm.name} />
                                            </div>
                                            {llm.alignmentScore !== null && (
                                                <div className="text-sm font-bold">
                                                    {llm.alignmentScore.toFixed(1)}%
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
