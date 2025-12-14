'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TransitionIris from './TransitionIris';
import LeaderboardTable from './LeaderboardTable';
import ThemeToggle from './ThemeToggle';

type LLMWithVotes = {
    id: string;
    name: string;
    modelId: string;
    reasoningEffort: string | null;
    alignmentScore: number | null;
    votes: Array<{
        id: string;
        choice: string;
        reasoning: string | null;
        principles: string[];
        assumptions: string | null;
        requestPayload: string | null;
        audioUrl: string | null;
        problem: {
            id: string;
            title: string;
            text: string;
            humanPullVotes: number;
            humanNothingVotes: number;
        };
    }>;
    provider: {
        id: string;
        name: string;
        logoUrl: string;
        voiceId: string | null;
    } | null;
};

export default function LeaderboardClient({ llms }: { llms: LLMWithVotes[] }) {
    const router = useRouter();
    const [isExiting, setIsExiting] = useState(false);

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsExiting(true);
    };

    return (
        <main className="min-h-screen p-4 md:p-12 bg-white dark:bg-zinc-950 text-black dark:text-white font-comic selection:bg-yellow-200 dark:selection:bg-yellow-500">
            <TransitionIris
                isOpen={!isExiting}
                onCloseComplete={() => router.push('/browse')}
            />

            <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
                <header className="space-y-2 text-center relative">
                    {/* Theme Toggle */}
                    <div className="absolute top-0 right-0 z-50">
                        <ThemeToggle />
                    </div>

                    <h1 className="text-4xl md:text-7xl font-black tracking-tight transform -rotate-2 flex items-center justify-center gap-4 flex-wrap no-pseudo-transition">
                        <img src="/logo.png" alt="" className="w-12 h-12 md:w-20 md:h-20 object-contain" />
                        <span>Trolley <span className="relative inline-block px-4 text-black before:absolute before:inset-0 before:bg-yellow-400 before:-skew-y-3 before:-z-10 border-b-4 border-black dark:border-white border-dashed">LLM Arena</span></span>
                        <span className="text-lg md:text-2xl text-black dark:text-white font-bold self-end -ml-2">(beta)</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-bold">
                        "Viewing the morality of Artificial Intelligence through the lens of
                        the data-driven Trolley Problem."
                    </p>
                    <div className="pt-4 relative z-10">
                        <a
                            href="/browse"
                            onClick={handleBack}
                            className="inline-block w-full md:w-auto py-3 px-4 md:px-8 bg-black text-white font-black rounded-xl border-4 border-black dark:border-zinc-600 hover:bg-yellow-400 hover:text-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.2)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all uppercase tracking-widest text-sm md:text-lg transform rotate-1 hover:rotate-0"
                        >
                            <span className="flex items-center justify-center gap-2 md:gap-3 whitespace-nowrap">
                                <span>🚋</span> Go To Arena <span>🎲</span>
                            </span>
                        </a>
                    </div>
                </header>

                <LeaderboardTable llms={llms} />

                <footer className="text-center text-zinc-500 dark:text-zinc-400 pt-12 font-bold border-t-2 border-zinc-100 dark:border-zinc-800 mt-12">
                    <p>© 2025 Trolley LLM Arena. Built for science (and fun). 🧪</p>
                </footer>
            </div>
        </main>
    );
}

