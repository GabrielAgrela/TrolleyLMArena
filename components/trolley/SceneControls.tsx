'use client';

type SceneControlsProps = {
    onViewLeaderboard: () => void;
    onSelectProblem: () => void;
    onNextProblem: () => void;
    isDisabled?: boolean;
};

export default function SceneControls({
    onViewLeaderboard,
    onSelectProblem,
    onNextProblem,
    isDisabled = false
}: SceneControlsProps) {
    return (
        <div className="p-4 border-t-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 space-y-3">
            <button
                onClick={onViewLeaderboard}
                disabled={isDisabled}
                className="w-full py-3 bg-yellow-400 text-black font-black rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all font-comic uppercase tracking-widest text-sm relative group overflow-hidden flex items-center justify-center disabled:cursor-not-allowed"
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>🏆</span> View Leaderboard <span>👑</span>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>

            <button
                onClick={onSelectProblem}
                disabled={isDisabled}
                className="w-full py-2 bg-white dark:bg-zinc-700 text-black dark:text-white font-bold rounded-xl border-2 border-black dark:border-zinc-600 shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(0,0,0,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all font-comic text-xs uppercase tracking-widest relative group overflow-hidden flex items-center justify-center disabled:cursor-not-allowed mb-2"
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    Select Problem 🔎
                </span>
            </button>

            <button
                onClick={onNextProblem}
                disabled={isDisabled}
                className="w-full py-3 bg-green-400 text-black font-black rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all font-comic uppercase tracking-widest text-sm relative group overflow-hidden flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    Next Problem <span>🎲</span>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
        </div>
    );
}

