'use client';

import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

type VoteData = {
    id: string;
    choice: string;
    reasoning: string | null;
    principles: string[];
    assumptions: string | null;
    problem: {
        id: string;
        title: string;
        text: string;
        humanPullVotes: number;
        humanNothingVotes: number;
    }
};

type LLMData = {
    id: string;
    name: string;
    modelId: string;
    votes: VoteData[];
};

// Helper to determine the "popular" human choice and percentage
function getHumanStats(humanPull: number, humanNothing: number, aiChoice: string) {
    const total = humanPull + humanNothing;
    if (total === 0) return { majorityChoice: 'tie', sameChoicePercentage: 0 };

    const majorityChoice = humanPull > humanNothing ? 'pull' : 'nothing';
    const isTie = humanPull === humanNothing;

    // Calculate percentage of humans who made the SAME choice as the AI
    const aiChoiceCount = aiChoice === 'pull' ? humanPull : humanNothing;
    const sameChoicePercentage = Math.round((aiChoiceCount / total) * 100);

    return {
        majorityChoice: isTie ? 'tie' : majorityChoice,
        sameChoicePercentage
    };
}

export default function ComparisonModal({ llms, onClose }: { llms: LLMData[], onClose: () => void }) {
    const [problems, setProblems] = useState<any[]>([]);

    useEffect(() => {
        // Collect all unique problem IDs
        const problemMap = new Map();
        llms.forEach(llm => {
            llm.votes.forEach(vote => {
                if (!problemMap.has(vote.problem.id)) {
                    problemMap.set(vote.problem.id, vote.problem);
                }
            });
        });
        setProblems(Array.from(problemMap.values()));
    }, [llms]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200 font-comic">
            <div className="bg-white border-4 border-black rounded-3xl w-full max-w-7xl h-[90vh] flex flex-col shadow-[16px_16px_0px_rgba(0,0,0,1)] selection:bg-yellow-200">
                {/* Header */}
                <div className="p-6 border-b-4 border-black flex justify-between items-center shrink-0 bg-yellow-50 rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">⚔️</span>
                        <div>
                            <h2 className="text-3xl font-black text-black uppercase tracking-wide transform -rotate-1">Battle of the Bots</h2>
                            <p className="text-sm font-bold text-zinc-600">Comparing {llms.length} models across {problems.length} scenarios</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-red-500 hover:bg-red-400 border-4 border-black rounded-xl transition-all hover:-translate-y-1 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0 text-white font-black">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-8 bg-zinc-50">
                    <div className="grid gap-12">
                        {problems.map((problem, index) => {
                            const total = problem.humanPullVotes + problem.humanNothingVotes;
                            const pullPercent = total > 0 ? Math.round((problem.humanPullVotes / total) * 100) : 0;
                            const nothingPercent = total > 0 ? Math.round((problem.humanNothingVotes / total) * 100) : 0;
                            const majorityChoice = problem.humanPullVotes > problem.humanNothingVotes ? 'PULL' : 'DO NOTHING';
                            const majorityPercent = problem.humanPullVotes > problem.humanNothingVotes ? pullPercent : nothingPercent;

                            return (
                                <div key={problem.id} className="space-y-6">
                                    {/* Problem Header */}
                                    <div className="flex flex-col md:flex-row gap-6 items-start border-b-2 border-dashed border-zinc-300 pb-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-black text-white px-3 py-1 font-black rounded-lg text-sm border-2 border-transparent">#{index + 1}</span>
                                                <h3 className="text-2xl font-black text-black">{problem.title}</h3>
                                            </div>
                                            <p className="text-lg text-zinc-700 font-medium leading-relaxed max-w-4xl">{problem.text}</p>
                                        </div>
                                        <div className="shrink-0 flex flex-col items-end">
                                            <div className="text-xs uppercase text-zinc-500 font-bold mb-1 tracking-widest">Human Consensus</div>
                                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] transform rotate-2">
                                                <span className={`font-black text-lg ${majorityChoice === 'PULL' ? 'text-green-600' : 'text-red-600'}`}>{majorityChoice}</span>
                                                <span className="text-black font-bold border-l-2 border-zinc-200 pl-3">{majorityPercent}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Answers Grid */}
                                    <div className={`grid gap-6 grid-cols-1 md:grid-cols-${Math.max(2, llms.length)}`}>
                                        {llms.map(llm => {
                                            const vote = llm.votes.find(v => v.problem.id === problem.id);
                                            if (!vote) return (
                                                <div key={llm.id} className="border-4 border-dashed border-zinc-300 rounded-2xl p-6 flex items-center justify-center text-zinc-400 font-bold">
                                                    No choice recorded 🤷‍♂️
                                                </div>
                                            );

                                            const { majorityChoice: statsMajority } = getHumanStats(problem.humanPullVotes, problem.humanNothingVotes, vote.choice);
                                            const aligned = vote.choice === statsMajority;

                                            return (
                                                <div key={llm.id} className={`p-5 rounded-2xl border-4 border-black flex flex-col gap-4 relative group hover:-translate-y-1 transition-transform bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)]`}>
                                                    {/* Alignment Stamp */}
                                                    <div className={`absolute -top-3 -right-2 rotate-6 px-3 py-1 border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] z-10 ${aligned ? 'bg-green-300 text-green-900' : 'bg-red-300 text-red-900'}`}>
                                                        {aligned ? 'Aligned' : 'Diverged'}
                                                    </div>

                                                    <div className="flex justify-between items-center border-b-2 border-black pb-3">
                                                        <span className="font-black text-lg truncate pr-4">{llm.name}</span>
                                                        <span className="shrink-0 px-2 py-1 bg-black text-white text-xs font-bold uppercase rounded border-2 border-transparent">
                                                            {vote.choice}
                                                        </span>
                                                    </div>

                                                    {/* Reasoning */}
                                                    <div className="relative bg-zinc-50 border-2 border-black rounded-xl p-4 mt-2 flex-1">
                                                        <div className="absolute -top-3 left-6 w-4 h-4 bg-zinc-50 border-t-2 border-l-2 border-black transform rotate-45"></div>
                                                        <p className="text-sm text-zinc-800 italic font-medium leading-relaxed">
                                                            "{vote.reasoning}"
                                                        </p>
                                                    </div>

                                                    {/* Principles & Assumptions */}
                                                    <div className="space-y-2">
                                                        {vote.principles && vote.principles.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {vote.principles.slice(0, 3).map((p, i) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-yellow-200 border border-black rounded text-[10px] font-bold uppercase text-black line-clamp-1 max-w-full">
                                                                        {p}
                                                                    </span>
                                                                ))}
                                                                {vote.principles.length > 3 && (
                                                                    <span className="px-2 py-0.5 bg-zinc-200 border border-black rounded text-[10px] font-bold text-zinc-600">
                                                                        +{vote.principles.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {vote.assumptions && (
                                                            <div className="text-[10px] text-zinc-500 italic px-2 border-l-2 border-zinc-300">
                                                                Assuming: {vote.assumptions.slice(0, 50)}...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
