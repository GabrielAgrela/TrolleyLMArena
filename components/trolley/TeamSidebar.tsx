'use client';

type TrolleyVote = {
    id: string;
    llm: {
        name: string;
        provider?: {
            name: string;
            logoUrl: string;
        } | null;
    };
    choice: string;
    reasoning: string | null;
    principles: string[];
    audioUrl?: string | null;
};

type VoteItemProps = {
    vote: TrolleyVote;
    onHover: (v: TrolleyVote | null, e?: React.MouseEvent) => void;
};

function VoteItem({ vote, onHover }: VoteItemProps) {
    const isHuman = vote.id === 'humanity';

    return (
        <button
            onMouseEnter={(e) => onHover(vote, e)}
            onMouseLeave={() => onHover(null)}
            className={`w-full text-left px-3 py-2 rounded transition-colors group flex items-center gap-2 ${isHuman
                ? 'bg-yellow-300 text-black hover:bg-yellow-400 font-black border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                : 'hover:bg-black dark:hover:bg-zinc-700 hover:text-white'
                }`}
        >
            {isHuman ? (
                <div className="w-5 h-5 shrink-0 flex items-center justify-center text-base">
                    👥
                </div>
            ) : vote.llm.provider?.logoUrl ? (
                <div className="w-6 h-6 shrink-0 p-0.5 bg-white rounded-full border border-zinc-200 dark:border-zinc-600 overflow-hidden flex items-center justify-center">
                    <img src={vote.llm.provider.logoUrl} alt="" className="w-full h-full object-contain" />
                </div>
            ) : (
                <div className="w-6 h-6 shrink-0 bg-zinc-900 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {vote.llm.name[0]}
                </div>
            )}

            <div className="flex-1 min-w-0">
                <span className={`font-comic text-sm block truncate ${isHuman ? 'uppercase tracking-wider' : 'font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-white'}`}>
                    {vote.llm.name}
                </span>
            </div>
        </button>
    );
}

type TeamSidebarProps = {
    pullers: TrolleyVote[];
    bystanders: TrolleyVote[];
    onHover: (v: TrolleyVote | null, e?: React.MouseEvent) => void;
};

export default function TeamSidebar({ pullers, bystanders, onHover }: TeamSidebarProps) {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Pullers Group */}
            <div className="bg-green-50/50 dark:bg-green-950/30 rounded-xl p-3 border-2 border-green-200 dark:border-green-800">
                <div className="text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-400 mb-3 font-comic flex items-center gap-2 border-b border-green-200 dark:border-green-800 pb-2">
                    <span>✅</span> Team Pull ({pullers.length})
                </div>
                <div className="space-y-1">
                    {pullers.map(vote => (
                        <VoteItem key={vote.id} vote={vote} onHover={onHover} />
                    ))}
                </div>
            </div>

            {/* Bystanders Group */}
            <div className="bg-red-50/50 dark:bg-red-950/30 rounded-xl p-3 border-2 border-red-200 dark:border-red-800">
                <div className="text-xs font-bold uppercase tracking-widest text-red-700 dark:text-red-400 mb-3 font-comic flex items-center gap-2 border-b border-red-200 dark:border-red-800 pb-2">
                    <span>🛑</span> Team Do Nothing ({bystanders.length})
                </div>
                <div className="space-y-1">
                    {bystanders.map(vote => (
                        <VoteItem key={vote.id} vote={vote} onHover={onHover} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export type { TrolleyVote };

