'use client';

import { clsx } from 'clsx';
import type { Vote, HumanStats } from '@/types';

type VoteCardProps = {
    vote: Vote;
    onViewPayload: (payload: string) => void;
};

// Helper to determine the "popular" human choice and percentage
function getHumanStats(humanPull: number, humanNothing: number, aiChoice: string): HumanStats {
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

export default function VoteCard({ vote, onViewPayload }: VoteCardProps) {
    const hPull = vote.problem.humanPullVotes;
    const hNothing = vote.problem.humanNothingVotes;
    const { majorityChoice, sameChoicePercentage } = getHumanStats(hPull, hNothing, vote.choice);
    const aligned = vote.choice === majorityChoice;

    return (
        <div
            className="bg-white dark:bg-zinc-800 p-5 rounded-2xl border-4 border-black dark:border-zinc-600 shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_rgba(0,0,0,0.5)] flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform"
        >
            {/* Sticker: Alignment */}
            <div className={`absolute top-4 right-4 rotate-12 px-3 py-1 border-2 border-black font-black uppercase tracking-widest text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] z-10 ${aligned ? 'bg-green-300 text-green-900' : 'bg-red-300 text-red-900'}`}>
                {aligned ? 'Aligned 👍' : 'Misaligned 👎'}
            </div>

            {/* Problem Header */}
            <div className="pr-40">
                <h4 className="font-black text-lg leading-tight mb-1">{vote.problem.title}</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug line-clamp-2 hover:line-clamp-none transition-all">{vote.problem.text}</p>
            </div>

            {/* The Choice Panel */}
            <div className="flex border-2 border-black dark:border-zinc-600 rounded-xl overflow-hidden text-center text-sm font-bold">
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-700 p-2 border-r-2 border-black dark:border-zinc-600 flex flex-col justify-center">
                    <span className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">AI Chose</span>
                    <span className="uppercase text-lg">{vote.choice}</span>
                </div>
                <div className="flex-1 bg-yellow-100 dark:bg-yellow-600/30 p-2 flex flex-col justify-center">
                    <span className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">Human Consensus</span>
                    <span>{sameChoicePercentage}% agree</span>
                </div>
            </div>

            {/* Reasoning Bubble */}
            <div className="relative bg-zinc-50 dark:bg-zinc-700 border-2 border-black dark:border-zinc-600 rounded-xl p-4 mt-2">
                {/* Tail */}
                <div className="absolute -top-3 left-8 w-4 h-4 bg-zinc-50 dark:bg-zinc-700 border-t-2 border-l-2 border-black dark:border-zinc-600 transform rotate-45"></div>

                {/* Actions: Request Payload */}
                {vote.requestPayload && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewPayload(vote.requestPayload!);
                        }}
                        className="absolute top-2 right-2 text-zinc-400 hover:text-black dark:hover:text-white hover:scale-110 transition-all"
                        title="View Request Payload"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                    </button>
                )}

                <p className="italic text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed">
                    "{vote.reasoning}"
                </p>
            </div>

            {/* Principles - Tags */}
            {vote.principles && vote.principles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    {vote.principles.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-600/30 border border-black dark:border-yellow-500 rounded-md text-[10px] font-bold uppercase text-black dark:text-yellow-200 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                            {p}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

