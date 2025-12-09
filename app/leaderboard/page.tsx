
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
                    <div className="pt-8">
                        <Link
                            href="/"
                            className="block w-fit mx-auto py-3 px-8 bg-green-400 text-black font-black rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all font-comic uppercase tracking-widest text-sm relative group overflow-hidden flex items-center justify-center gap-2"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <span>🎲</span> Back to Arena <span>🚋</span>
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
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
