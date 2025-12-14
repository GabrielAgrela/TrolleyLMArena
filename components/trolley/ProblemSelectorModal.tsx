'use client';

import { motion, AnimatePresence } from 'framer-motion';

type ProblemSelectorModalProps = {
    isOpen: boolean;
    onClose: () => void;
    problems: Array<{ id: string; title: string }>;
    currentProblemId: string;
    onSelectProblem: (problemId: string) => void;
};

export default function ProblemSelectorModal({
    isOpen,
    onClose,
    problems,
    currentProblemId,
    onSelectProblem
}: ProblemSelectorModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-zinc-700 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b-2 border-black dark:border-zinc-700 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800">
                            <h2 className="text-2xl font-black font-comic dark:text-white">Select a Problem</h2>
                            <button onClick={onClose} className="text-2xl hover:scale-110 transition-transform">✖️</button>
                        </div>
                        <div className="overflow-y-auto p-4 space-y-2">
                            {problems.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        onClose();
                                        onSelectProblem(p.id);
                                    }}
                                    className={`w-full text-left p-4 rounded-xl border-2 border-black dark:border-zinc-600 font-comic hover:bg-yellow-300 hover:text-black hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all ${p.id === currentProblemId ? 'bg-yellow-100 dark:bg-yellow-600/30 dark:text-yellow-200' : 'bg-white dark:bg-zinc-800 dark:text-white'}`}
                                >
                                    <div className="font-bold text-lg">{p.title}</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

