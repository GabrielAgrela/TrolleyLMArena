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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
                    <h2 className="text-2xl font-bold text-white">Compare Models</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="grid gap-8">
                        {problems.map(problem => {
                            const total = problem.humanPullVotes + problem.humanNothingVotes;
                            const pullPercent = total > 0 ? Math.round((problem.humanPullVotes / total) * 100) : 0;
                            const nothingPercent = total > 0 ? Math.round((problem.humanNothingVotes / total) * 100) : 0;
                            const majorityChoice = problem.humanPullVotes > problem.humanNothingVotes ? 'PULL' : 'DO NOTHING';
                            const majorityPercent = problem.humanPullVotes > problem.humanNothingVotes ? pullPercent : nothingPercent;

                            return (
                                <div key={problem.id} className="space-y-4">
                                    <div className="border-b border-white/5 pb-2 flex justify-between items-end">
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-200">{problem.title}</h3>
                                            <p className="text-sm text-zinc-500 line-clamp-2 hover:line-clamp-none transition-all mr-4">{problem.text}</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Human Majority</div>
                                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                                <span className={`font-black ${majorityChoice === 'PULL' ? 'text-white' : 'text-zinc-400'}`}>{majorityChoice}</span>
                                                <span className="text-zinc-500 text-xs">({majorityPercent}%)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`grid gap-4 grid-cols-1 md:grid-cols-${llms.length}`}>
                                        {llms.map(llm => {
                                            const vote = llm.votes.find(v => v.problem.id === problem.id);
                                            if (!vote) return <div key={llm.id} className="text-zinc-600 italic">No data</div>;

                                            const { majorityChoice: statsMajority } = getHumanStats(problem.humanPullVotes, problem.humanNothingVotes, vote.choice);
                                            const aligned = vote.choice === statsMajority;

                                            return (
                                                <div key={llm.id} className={`p-4 rounded-xl border flex flex-col gap-3 ${aligned ? 'border-green-500/10 bg-green-500/5' : 'border-red-500/10 bg-red-500/5'}`}>
                                                    <div className="flex justify-between items-center text-xs text-zinc-400 border-b border-white/5 pb-2">
                                                        <span className="font-bold text-white">{llm.name}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${aligned ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {vote.choice}
                                                        </span>
                                                    </div>

                                                    {/* Reasoning */}
                                                    <div className="text-sm text-zinc-400 italic bg-black/20 p-3 rounded-lg flex-1">
                                                        "{vote.reasoning}"
                                                    </div>

                                                    {/* Principles Snippet */}
                                                    {vote.principles && vote.principles.length > 0 && (
                                                        <div className="text-[10px] text-zinc-500">
                                                            <span className="text-blue-400 font-bold">Principles: </span>
                                                            {vote.principles[0]} {vote.principles.length > 1 && `+${vote.principles.length - 1} more`}
                                                        </div>
                                                    )}
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
