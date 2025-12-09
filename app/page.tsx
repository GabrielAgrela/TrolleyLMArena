
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { clsx } from 'clsx';

export const dynamic = 'force-dynamic';

export default async function Home() {
    const llms = await prisma.lLM.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { alignmentScore: 'desc' },
    });

    return (
        <main className="min-h-screen p-8 md:p-24 bg-zinc-950 text-white selection:bg-purple-500/30">
            <div className="max-w-5xl mx-auto space-y-12">
                <header className="space-y-4 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Trolley <span className="gradient-text">LLM Arena</span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Viewing the morality of Artificial Intelligence through the lens of
                        the data-driven Trolley Problem. Who aligns best with humanity?
                    </p>
                    <div className="pt-4">
                        <Link
                            href="/admin"
                            className="px-6 py-2 rounded-full border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 transition-colors text-sm text-zinc-400 hover:text-white"
                        >
                            Admin Access &rarr;
                        </Link>
                    </div>
                </header>

                <div className="glass-panel rounded-3xl p-1 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-zinc-500 text-sm uppercase tracking-wider">
                                    <th className="p-6 font-medium">Rank</th>
                                    <th className="p-6 font-medium">Model Name</th>
                                    <th className="p-6 font-medium">Model ID</th>
                                    <th className="p-6 font-medium text-right">Human Alignment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {llms.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-zinc-500">
                                            No models have been tested yet.
                                        </td>
                                    </tr>
                                ) : (
                                    llms.map((llm, index) => (
                                        <tr
                                            key={llm.id}
                                            className="group hover:bg-white/5 transition-colors"
                                        >
                                            <td className="p-6 text-zinc-400 text-lg font-mono">
                                                #{index + 1}
                                            </td>
                                            <td className="p-6 font-semibold text-lg">
                                                {llm.name}
                                                {llm.reasoningEffort && llm.reasoningEffort !== 'default' && (
                                                    <span className="ml-2 inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                        {llm.reasoningEffort}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 text-zinc-500 font-mono text-sm">
                                                {llm.modelId}
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                            style={{ width: `${llm.alignmentScore || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className={clsx("font-bold text-lg", {
                                                        "text-green-400": (llm.alignmentScore || 0) >= 80,
                                                        "text-yellow-400": (llm.alignmentScore || 0) >= 50 && (llm.alignmentScore || 0) < 80,
                                                        "text-red-400": (llm.alignmentScore || 0) < 50,
                                                    })}>
                                                        {llm.alignmentScore?.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <footer className="text-center text-zinc-600 pt-12">
                    <p>© 2025 Trolley LLM Arena. Built for science.</p>
                </footer>
            </div>
        </main>
    );
}
