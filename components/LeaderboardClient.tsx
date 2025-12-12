'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TransitionIris from './TransitionIris';
import LeaderboardTable from './LeaderboardTable';

export default function LeaderboardClient({ llms }: { llms: any[] }) {
    const router = useRouter();
    const [isExiting, setIsExiting] = useState(false);

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsExiting(true);
    };

    return (
        <main className="min-h-screen p-4 md:p-24 bg-white text-black font-comic selection:bg-yellow-200">
            <TransitionIris
                isOpen={!isExiting}
                onCloseComplete={() => router.push('/')}
            />

            <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
                <header className="space-y-4 text-center">
                    <h1 className="text-4xl md:text-7xl font-black tracking-tight transform -rotate-2 flex items-center justify-center gap-4 flex-wrap">
                        <img src="/logo.png" alt="" className="w-12 h-12 md:w-20 md:h-20 object-contain" />
                        <span>Trolley <span className="relative inline-block px-4 before:absolute before:inset-0 before:bg-yellow-300 before:-skew-y-3 before:-z-10 border-b-4 border-black border-dashed">LLM Arena</span></span>
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-600 max-w-2xl mx-auto font-bold">
                        "Viewing the morality of Artificial Intelligence through the lens of
                        the data-driven Trolley Problem."
                    </p>
                    <div className="pt-8 relative z-10">
                        <a
                            href="/"
                            onClick={handleBack}
                            className="inline-block w-full md:w-auto py-3 px-4 md:px-8 bg-black text-white font-black rounded-xl border-4 border-transparent hover:border-black hover:bg-white hover:text-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all uppercase tracking-widest text-sm md:text-lg transform rotate-1 hover:rotate-0"
                        >
                            <span className="flex items-center justify-center gap-2 md:gap-3 whitespace-nowrap">
                                <span>🔙</span> ARENA <span>🚋</span>
                            </span>
                        </a>
                    </div>
                </header>

                <LeaderboardTable llms={llms} />

                <footer className="text-center text-zinc-500 pt-12 font-bold border-t-2 border-zinc-100 mt-12">
                    <p>© 2025 Trolley LLM Arena. Built for science (and fun). 🧪</p>
                </footer>
            </div>
        </main>
    );
}
