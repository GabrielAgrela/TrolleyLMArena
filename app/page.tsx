
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { clsx } from 'clsx';
import LeaderboardTable from '@/components/LeaderboardTable';

export const dynamic = 'force-dynamic';

export default async function Home() {
    const llms = await prisma.lLM.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { alignmentScore: 'desc' },
        include: {
            votes: {
                include: {
                    problem: true
                }
            }
        }
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

                <LeaderboardTable llms={llms as any} />

                <footer className="text-center text-zinc-600 pt-12">
                    <p>© 2025 Trolley LLM Arena. Built for science.</p>
                </footer>
            </div>
        </main>
    );
}
