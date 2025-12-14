'use client';

import { clsx } from 'clsx';

type AlignmentRatingCellProps = {
    rating: number;
    consensusHits: number;
    totalVotes: number;
    isExpanded?: boolean;
    isSelected?: boolean;
};

export default function AlignmentRatingCell({
    rating,
    consensusHits,
    totalVotes,
    isExpanded = false,
    isSelected = false
}: AlignmentRatingCellProps) {
    return (
        <td className={`py-1 px-2 md:px-4 text-center group-hover:bg-yellow-50 transition-colors ${isExpanded ? 'bg-yellow-100' : ''} ${isSelected ? 'bg-green-50' : ''}`}>
            <div className="flex flex-col items-center gap-1">
                <span className={clsx("font-black text-lg md:text-2xl", {
                    "text-green-600": rating >= 80,
                    "text-yellow-600": rating >= 60 && rating < 80,
                    "text-red-600": rating < 60,
                })}>
                    {rating.toFixed(1)}
                </span>

                <div className="w-16 md:w-32 h-2 md:h-4 bg-white border md:border-2 border-black rounded-full overflow-hidden relative shadow-[1px_1px_0px_rgba(0,0,0,0.2)] md:shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                    <div
                        className="h-full bg-green-400 border-r md:border-r-2 border-black"
                        style={{ width: `${rating}%` }}
                    />
                </div>

                <span className="text-[8px] md:text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    {consensusHits}/{totalVotes} <span className="hidden md:inline">Aligned problems</span><span className="md:hidden">hits</span>
                </span>
            </div>
        </td>
    );
}
