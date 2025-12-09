'use client';

import { useState, Fragment } from 'react';
import { clsx } from 'clsx';

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
        problem: {
            id: string;
            title: string;
            text: string;
            humanPullVotes: number;
            humanNothingVotes: number;
        }
    }>;
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

import ComparisonModal from './ComparisonModal';

export default function LeaderboardTable({ llms }: { llms: LLMWithVotes[] }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showComparison, setShowComparison] = useState(false);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            if (newSet.size >= 3) {
                // limit text
                alert("You can compare up to 3 models at a time.");
                return;
            }
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const selectedLLMs = llms.filter(llm => selectedIds.has(llm.id));

    return (
        <div className="space-y-4">
            {/* Action Bar */}
            <div className={`flex justify-end transition-all duration-300 ${selectedIds.size >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <button
                    onClick={() => setShowComparison(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <span>Compare ({selectedIds.size})</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </button>
            </div>

            <div className="glass-panel rounded-3xl p-1 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-zinc-500 text-sm uppercase tracking-wider">
                                <th className="p-6 font-medium w-16 text-center">Compare</th>
                                <th className="p-6 font-medium">Rank</th>
                                <th className="p-6 font-medium">Model Name</th>
                                <th className="p-6 font-medium">Model ID</th>
                                <th className="p-6 font-medium text-right">Human Alignment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {llms.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-zinc-500">
                                        No models have been tested yet.
                                    </td>
                                </tr>
                            ) : (
                                llms.map((llm, index) => {
                                    const isExpanded = expandedId === llm.id;
                                    const isSelected = selectedIds.has(llm.id);

                                    return (
                                        <Fragment key={llm.id}>
                                            <tr
                                                onClick={() => toggleExpand(llm.id)}
                                                className={`group cursor-pointer transition-colors ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5'} ${isSelected ? 'bg-blue-500/5' : ''}`}
                                            >
                                                <td className="p-6 text-center">
                                                    <div
                                                        onClick={(e) => toggleSelection(llm.id, e)}
                                                        className={`w-5 h-5 rounded border mx-auto flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-zinc-700 hover:border-zinc-500'}`}
                                                    >
                                                        {isSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                </td>
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
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={5} className="bg-black/20 p-0">
                                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                                            {llm.votes.map((vote) => {
                                                                const { majorityChoice, sameChoicePercentage } = getHumanStats(vote.problem.humanPullVotes, vote.problem.humanNothingVotes, vote.choice);
                                                                const aligned = vote.choice === majorityChoice;

                                                                return (
                                                                    <div key={vote.id} className={`p-4 rounded-xl border flex flex-col gap-3 ${aligned ? 'border-green-500/10 bg-green-500/5' : 'border-red-500/10 bg-red-500/5'}`}>
                                                                        {/* Header */}
                                                                        <div className="flex justify-between items-start">
                                                                            <div>
                                                                                <span className="font-bold text-zinc-200 block">{vote.problem.title}</span>
                                                                                <span className="text-xs text-zinc-500 mt-1 block leading-relaxed line-clamp-2 hover:line-clamp-none transition-all cursor-help" title={vote.problem.text}>
                                                                                    {vote.problem.text}
                                                                                </span>
                                                                            </div>
                                                                            <span className={`shrink-0 ml-2 px-2 py-0.5 rounded text-xs uppercase tracking-wide font-bold ${aligned ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'}`}>
                                                                                {aligned ? 'Aligned' : 'Diverged'}
                                                                            </span>
                                                                        </div>

                                                                        {/* Stats */}
                                                                        <div className="flex items-center gap-4 text-xs font-mono border-y border-white/5 py-2">
                                                                            <div className="flex flex-col">
                                                                                <span className="text-zinc-500">AI Choice</span>
                                                                                <span className="uppercase font-black text-sm underline decoration-2 underline-offset-2 text-white">
                                                                                    {vote.choice}
                                                                                </span>
                                                                            </div>
                                                                            <div className="w-px h-6 bg-white/10"></div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-zinc-500">Human Consensus</span>
                                                                                <span className="text-white">
                                                                                    {!aligned && 'only '}{sameChoicePercentage}% of humans would also
                                                                                    <span className="uppercase font-black ml-1 text-sm underline decoration-2 underline-offset-2 text-white">
                                                                                        {vote.choice}
                                                                                    </span>
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Reasoning */}
                                                                        <div className="text-sm text-zinc-400 italic bg-black/20 p-3 rounded-lg relative mt-auto">
                                                                            <span className="absolute -top-2 left-2 text-[10px] uppercase font-bold text-zinc-600 bg-zinc-900 px-1 rounded border border-zinc-800">
                                                                                LLM Reasoning
                                                                            </span>
                                                                            "{vote.reasoning}"
                                                                        </div>

                                                                        {/* Principles */}
                                                                        {vote.principles && vote.principles.length > 0 && (
                                                                            <div className="text-sm bg-black/20 p-3 rounded-lg relative mt-2">
                                                                                <span className="absolute -top-2 left-2 text-[10px] uppercase font-bold text-blue-300 bg-zinc-900 px-1 rounded border border-blue-900">
                                                                                    My Principles
                                                                                </span>
                                                                                <ul className="list-disc list-inside text-zinc-400 text-xs space-y-1 mt-1">
                                                                                    {vote.principles.map((p, i) => (
                                                                                        <li key={i}>{p}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}

                                                                        {/* Assumptions */}
                                                                        {vote.assumptions && (
                                                                            <div className="text-sm bg-black/20 p-3 rounded-lg relative mt-2">
                                                                                <span className="absolute -top-2 left-2 text-[10px] uppercase font-bold text-yellow-300 bg-zinc-900 px-1 rounded border border-yellow-900">
                                                                                    Assumptions Made
                                                                                </span>
                                                                                <p className="text-zinc-400 text-xs mt-1 italic">
                                                                                    "{vote.assumptions}"
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {/* Request Payload (Details) */}
                                                                        {vote.requestPayload && (
                                                                            <details className="mt-2 text-xs text-zinc-600">
                                                                                <summary className="cursor-pointer hover:text-zinc-400 transition-colors font-mono">🔍 View Exact API Request Payload</summary>
                                                                                <pre className="mt-2 p-2 bg-black rounded overflow-x-auto whitespace-pre-wrap font-mono text-[10px] text-zinc-500 border border-zinc-800">
                                                                                    {vote.requestPayload}
                                                                                </pre>
                                                                            </details>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showComparison && (
                <ComparisonModal llms={selectedLLMs} onClose={() => setShowComparison(false)} />
            )}
        </div>
    );
}
