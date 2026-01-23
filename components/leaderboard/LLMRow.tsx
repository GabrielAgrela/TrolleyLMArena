'use client';

import { Fragment, useState } from 'react';
import { clsx } from 'clsx';
import { VoteCard } from './index';
import type { LLMWithVotes, LLMStats } from '@/types';

// Calculate LLM alignment stats from votes
export function calculateLLMStats(votes: LLMWithVotes['votes']): LLMStats {
    if (votes.length === 0) {
        return { consensusHits: 0, totalActualPct: 0, totalMaxPct: 0, totalMinPct: 0 };
    }

    return votes.reduce((acc, vote) => {
        const humanPull = vote.problem.humanPullVotes;
        const humanNothing = vote.problem.humanNothingVotes;
        const total = humanPull + humanNothing;

        if (total === 0) return acc;

        const aiChoiceVotes = vote.choice === 'pull' ? humanPull : humanNothing;
        const maxPossibleVotes = Math.max(humanPull, humanNothing);
        const minPossibleVotes = Math.min(humanPull, humanNothing);

        acc.totalActualPct += (aiChoiceVotes / total) * 100;
        acc.totalMaxPct += (maxPossibleVotes / total) * 100;
        acc.totalMinPct += (minPossibleVotes / total) * 100;

        // Track majority alignment
        const humanChoice = humanPull > humanNothing ? 'pull' : 'nothing';
        if (vote.choice === humanChoice) {
            acc.consensusHits++;
        }

        return acc;
    }, { consensusHits: 0, totalActualPct: 0, totalMaxPct: 0, totalMinPct: 0 });
}

// Calculate alignment rating from stats
export function calculateAlignmentRating(stats: LLMStats, voteCount: number): number {
    const range = stats.totalMaxPct - stats.totalMinPct;
    if (range > 0) {
        return ((stats.totalActualPct - stats.totalMinPct) / range) * 100;
    } else if (voteCount > 0) {
        return 100; // All ties = perfect alignment
    }
    return 0;
}

type LLMRowProps = {
    llm: LLMWithVotes;
    index: number;
    isExpanded: boolean;
    isSelected: boolean;
    onToggleExpand: () => void;
    onToggleSelect: (e: React.MouseEvent) => void;
    onViewPayload: (payload: string) => void;
};

export default function LLMRow({
    llm,
    index,
    isExpanded,
    isSelected,
    onToggleExpand,
    onToggleSelect,
    onViewPayload
}: LLMRowProps) {
    const [imageError, setImageError] = useState(false);
    const stats = calculateLLMStats(llm.votes);
    const alignmentRating = calculateAlignmentRating(stats, llm.votes.length);

    return (
        <Fragment>
            <tr
                onClick={onToggleExpand}
                className={`group cursor-pointer transition-all hover:outline hover:outline-2 hover:outline-black dark:hover:outline-zinc-400 hover:z-10 relative ${isExpanded ? 'bg-yellow-100 dark:bg-yellow-900/30 outline outline-2 outline-black dark:outline-zinc-400 z-10' : ''} ${isSelected ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
            >
                {/* Compare Checkbox */}
                <td className={`py-1 px-2 md:px-4 text-center border-r-2 border-zinc-200 dark:border-zinc-700 group-hover:border-black dark:group-hover:border-zinc-400 group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/20 transition-colors ${isExpanded ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''} ${isSelected ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                    <div
                        onClick={onToggleSelect}
                        className={`w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 mx-auto flex items-center justify-center transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.2)] ${isSelected ? 'bg-green-400 border-black text-black' : 'bg-zinc-100 dark:bg-zinc-800 border-black dark:border-zinc-400 hover:scale-110'}`}
                    >
                        {isSelected && <span className="text-sm font-bold">✓</span>}
                    </div>
                </td>

                {/* Rank */}
                <td className={`py-1 px-2 md:px-4 text-center font-black text-xl md:text-2xl border-r-2 border-zinc-200 dark:border-zinc-700 group-hover:border-black dark:group-hover:border-zinc-400 group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/20 transition-colors ${isExpanded ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''} ${isSelected ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                    #{index + 1}
                </td>

                {/* Decider */}
                <td className={`py-1 px-2 md:px-4 border-r-2 border-zinc-200 dark:border-zinc-700 group-hover:border-black dark:group-hover:border-zinc-400 group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/20 transition-colors ${isExpanded ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''} ${isSelected ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                    <div className="flex items-center gap-2 md:gap-3">
                        {llm.provider && !imageError && llm.provider.logoUrl && (
                            <div className="w-6 h-6 md:w-8 md:h-8 relative shrink-0">
                                <img
                                    src={llm.provider.logoUrl}
                                    alt={llm.provider.name}
                                    className="w-full h-full object-contain"
                                    onError={() => setImageError(true)}
                                />
                            </div>
                        )}
                        <span className="font-bold text-base md:text-xl line-clamp-1">{llm.name}</span>
                        {llm.reasoningEffort && llm.reasoningEffort !== 'default' && (
                            <span className="hidden md:inline-block px-2 py-1 rounded border-2 border-black dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-600 text-black dark:text-white text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                {llm.reasoningEffort}
                            </span>
                        )}
                    </div>
                </td>

                {/* Model ID */}
                <td className={`hidden md:table-cell py-1 px-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm border-r-2 border-zinc-200 dark:border-zinc-600 group-hover:border-black dark:group-hover:border-zinc-400 group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/20 transition-colors ${isExpanded ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''} ${isSelected ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                    {llm.modelId}
                </td>

                {/* Alignment Rating */}
                <td className={`py-2 px-2 md:px-4 text-center group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/20 transition-colors ${isExpanded ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''} ${isSelected ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                    <div className="flex items-center justify-center gap-2">
                        <span className={clsx("font-black text-lg md:text-xl transition-all duration-200", {
                            "text-green-600 dark:text-green-400": alignmentRating >= 80,
                            "text-yellow-600 dark:text-yellow-400": alignmentRating >= 60 && alignmentRating < 80,
                            "text-red-600 dark:text-red-400": alignmentRating < 60,
                        })}>
                            {alignmentRating.toFixed(1)}
                        </span>
                        <div className="relative w-0 group-hover:w-20 md:group-hover:w-28 h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 scale-x-0 group-hover:scale-x-100 origin-left">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${alignmentRating}%` }} />
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] md:text-[10px] font-bold text-zinc-700 dark:text-zinc-200 whitespace-nowrap">
                                {stats.consensusHits}/{llm.votes.length} aligned
                            </span>
                        </div>
                    </div>
                </td>
            </tr>

            {/* Expanded Vote Cards */}
            {isExpanded && (
                <tr>
                    <td colSpan={5} className="bg-zinc-50 dark:bg-zinc-950 p-0 border-y-4 border-black dark:border-zinc-700">
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                            {llm.votes.map((vote) => (
                                <VoteCard key={vote.id} vote={vote} onViewPayload={onViewPayload} />
                            ))}
                        </div>
                    </td>
                </tr>
            )}
        </Fragment>
    );
}

