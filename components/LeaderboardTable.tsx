'use client';

import { useState } from 'react';
import ComparisonModal from './ComparisonModal';
import { SearchBar, PaginationControls, PayloadModal, LLMRow, calculateLLMStats, calculateAlignmentRating } from './leaderboard';
import type { LLMWithVotes } from '@/types';

// Alignment Rating Tooltip Component
function AlignmentTooltip() {
    return (
        <div className="group relative">
            <span className="cursor-help text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
            </span>
            <div className="absolute top-full right-0 mt-4 w-80 p-6 bg-white dark:bg-zinc-800 text-black dark:text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-[8px_8px_0px_rgba(0,0,0,1)] border-4 border-black dark:border-zinc-600 leading-relaxed text-left font-comic">
                <p className="mb-2 text-xs">
                    Measures how close the AI is to the <strong>Perfect Human Consensus</strong>.
                </p>
                <div className="bg-zinc-50 dark:bg-zinc-700 p-3 rounded-lg border-2 border-black dark:border-zinc-600 space-y-2 mb-3">
                    <p className="text-[8px] leading-relaxed">
                        Questions with clearer consensus are worth more points.
                    </p>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] bg-white dark:bg-zinc-800 p-2 border border-zinc-200 dark:border-zinc-600 rounded">
                            <div className="flex flex-col">
                                <span className="font-bold">Strong Consensus (87% / 13%)</span>
                                <span className="text-zinc-500 dark:text-zinc-400">Clear right answer</span>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-green-600 dark:text-green-400">High Impact</span>
                                <span className="text-zinc-400">Big score swing</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] bg-white dark:bg-zinc-800 p-2 border border-zinc-200 dark:border-zinc-600 rounded">
                            <div className="flex flex-col">
                                <span className="font-bold">Divided Consensus (51% / 49%)</span>
                                <span className="text-zinc-500 dark:text-zinc-400">Ambiguous moral dilemma</span>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-yellow-600 dark:text-yellow-400">Low Impact</span>
                                <span className="text-zinc-400">Small score swing</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="font-mono text-[8px] text-black dark:text-white text-center bg-yellow-200 dark:bg-yellow-600 p-2 rounded border-2 border-black dark:border-yellow-700 font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] leading-tight">
                    Formula: (ActualPoints - MinPossible) / (MaxPossible - MinPossible)
                </div>
            </div>
        </div>
    );
}

export default function LeaderboardTable({ llms }: { llms: LLMWithVotes[] }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showComparison, setShowComparison] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [payloadContent, setPayloadContent] = useState<string | null>(null);

    const itemsPerPage = 5;

    // Helper to calculate alignment rating for an LLM
    const getAlignmentRating = (llm: LLMWithVotes) => {
        const stats = calculateLLMStats(llm.votes);
        return calculateAlignmentRating(stats, llm.votes.length);
    };

    // Filter LLMs based on search query
    const filteredLLMs = llms
        .filter(llm => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                llm.name.toLowerCase().includes(q) ||
                llm.modelId.toLowerCase().includes(q) ||
                (llm.provider?.name || '').toLowerCase().includes(q)
            );
        })
        // Sort by calculated alignment rating (descending) - same calculation as displayed
        .sort((a, b) => getAlignmentRating(b) - getAlignmentRating(a));

    const totalPages = Math.ceil(filteredLLMs.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLLMs = filteredLLMs.slice(indexOfFirstItem, indexOfLastItem);
    const selectedLLMs = llms.filter(llm => selectedIds.has(llm.id));

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        setExpandedId(null);
        document.getElementById('leaderboard-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            if (newSet.size >= 3) {
                alert("You can compare up to 3 models at a time.");
                return;
            }
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    return (
        <div className="space-y-6" id="leaderboard-table">
            {/* Floating Compare Button */}
            <div className="flex justify-end h-0 pointer-events-none relative z-20">
                <div className={`absolute bottom-4 right-0 transition-all duration-300 ${selectedIds.size >= 2 ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <button
                        onClick={() => setShowComparison(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-widest font-comic"
                    >
                        <span>Analyze Matchup ({selectedIds.size})</span>
                        <span className="text-xl">⚔️</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-zinc-700 rounded-3xl overflow-hidden shadow-[12px_12px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_rgba(0,0,0,0.8)]">
                {/* Header & Search */}
                <div className="p-4 md:p-6 border-b-4 border-black dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        <h2 className="font-black text-xl md:text-3xl uppercase tracking-wider transform -skew-x-6">Current Standings</h2>
                    </div>
                    <SearchBar value={searchQuery} onChange={handleSearch} />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-comic">
                        <thead className="bg-zinc-50 dark:bg-zinc-800 border-b-4 border-black dark:border-zinc-700 text-black dark:text-white">
                            <tr className="uppercase tracking-widest text-sm">
                                <th className="py-2 px-2 md:px-4 font-black w-10 md:w-20 text-center border-r-2 border-black dark:border-zinc-700 text-[10px] md:text-sm">Compare</th>
                                <th className="py-2 px-2 md:px-4 font-black w-10 md:w-24 text-center border-r-2 border-black dark:border-zinc-700 text-[10px] md:text-sm">Rank</th>
                                <th className="py-2 px-2 md:px-4 font-black border-r-2 border-black dark:border-zinc-700 text-[10px] md:text-sm">Decider</th>
                                <th className="hidden md:table-cell py-2 px-4 font-black border-r-2 border-black dark:border-zinc-700">Model ID</th>
                                <th className="py-2 px-2 md:px-4 font-black text-center text-[10px] md:text-sm">
                                    <div className="flex items-center justify-center gap-1 md:gap-2">
                                        <span className="hidden md:inline">Alignment Rating</span>
                                        <span className="md:hidden">Align.</span>
                                        <AlignmentTooltip />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-dashed divide-zinc-300 dark:divide-zinc-700">
                            {currentLLMs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-zinc-500 dark:text-zinc-400 font-bold text-xl">
                                        {searchQuery ? `No models found matching "${searchQuery}"` : "No models have been tested yet. Go run some!"}
                                    </td>
                                </tr>
                            ) : (
                                currentLLMs.map((llm, relativeIndex) => (
                                    <LLMRow
                                        key={llm.id}
                                        llm={llm}
                                        index={indexOfFirstItem + relativeIndex}
                                        isExpanded={expandedId === llm.id}
                                        isSelected={selectedIds.has(llm.id)}
                                        onToggleExpand={() => setExpandedId(expandedId === llm.id ? null : llm.id)}
                                        onToggleSelect={(e) => toggleSelection(llm.id, e)}
                                        onViewPayload={setPayloadContent}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            {showComparison && (
                <ComparisonModal llms={selectedLLMs} onClose={() => setShowComparison(false)} />
            )}

            {payloadContent && (
                <PayloadModal content={payloadContent} onClose={() => setPayloadContent(null)} />
            )}
        </div>
    );
}
