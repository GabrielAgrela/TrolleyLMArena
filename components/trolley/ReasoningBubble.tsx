'use client';

import React, { useRef, useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TrolleyVote } from './index';

type ReasoningBubbleProps = {
    hoverState: { vote: TrolleyVote; y: number } | null;
    windowHeight: number;
    isProgressSaved: boolean;
};

export default function ReasoningBubble({ hoverState, windowHeight, isProgressSaved }: ReasoningBubbleProps) {
    // Smart Positioning Logic
    const bubbleRef = useRef<HTMLDivElement>(null);
    const [bubbleHeight, setBubbleHeight] = useState(0);

    useLayoutEffect(() => {
        if (bubbleRef.current) {
            setBubbleHeight(bubbleRef.current.offsetHeight);
        }
    }, [hoverState?.vote.id, hoverState?.y, windowHeight]);

    if (!hoverState) return null;

    let bubbleTop = 0;
    let tailOffset = 0;

    if (windowHeight > 0) {
        // Desktop positioning logic (Mobile handles via CSS centering)
        const headerOffset = 40;
        const padding = 20;

        // Calculate the effective half-height of the bubble
        const currentHalfHeight = bubbleHeight > 0 ? (bubbleHeight / 2) : 100;

        // Boundaries for the CENTER of the bubble
        const minCenter = currentHalfHeight + headerOffset + padding;
        const maxCenter = windowHeight - currentHalfHeight - padding;

        // Clamp the bubble's center position
        bubbleTop = Math.max(Math.min(hoverState.y, maxCenter), minCenter);

        // Mobile Override: Keep bubble in the visualizer stage (top)
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            bubbleTop = windowHeight * 0.28;
        }

        // The tail needs to point to hoverState.y (the real target)
        const rawOffset = hoverState.y - bubbleTop;

        // Clamp the offset so the tail stays ON the bubble
        const maxDeviation = (bubbleHeight > 0 ? bubbleHeight / 2 : 100) - 30;
        tailOffset = Math.max(-maxDeviation, Math.min(maxDeviation, rawOffset));
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ top: bubbleTop }}
                className="absolute left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 -translate-y-1/2 w-[95%] md:w-full md:max-w-xl pointer-events-none z-50"
            >
                <div ref={bubbleRef} className="bg-white dark:bg-zinc-800 border-4 border-black dark:border-zinc-600 rounded-[2rem] shadow-[4px_4px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_rgba(0,0,0,1)] relative ml-0 md:ml-4 flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                    {/* Speech Bubble Tail - Pointing Left (Attached to outer shell) */}
                    <div style={{ transform: `translateY(${tailOffset}px)` }} className="hidden md:block absolute top-1/2 -left-6 -translate-y-1/2 w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[24px] border-r-black dark:border-r-zinc-600 transition-transform duration-100 z-10"></div>
                    <div style={{ transform: `translateY(${tailOffset}px)` }} className="hidden md:block absolute top-1/2 -left-[18px] -translate-y-1/2 w-0 h-0 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent border-r-[20px] border-r-white dark:border-r-zinc-800 transition-transform duration-100 z-20"></div>

                    {/* Content Area */}
                    <div className="p-4 md:p-6 rounded-[2rem] w-full max-h-[40vh] md:max-h-none overflow-y-auto md:overflow-visible">
                        <div className="flex items-start gap-4">
                            {hoverState.vote.id === 'humanity' ? (
                                <div className="shrink-0 w-12 h-12 flex items-center justify-center text-4xl -mt-2">
                                    👥
                                </div>
                            ) : hoverState.vote.llm.provider?.logoUrl ? (
                                <div className="shrink-0 w-12 h-12 flex items-center justify-center">
                                    <img src={hoverState.vote.llm.provider.logoUrl} alt={hoverState.vote.llm.provider.name} className="w-full h-full object-contain" />
                                </div>
                            ) : (
                                <div className="shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {hoverState.vote.llm.name[0]}
                                </div>
                            )}

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                        {hoverState.vote.id === 'humanity' ? (
                                            <span>HUMANITY SAYS {hoverState.vote.choice === 'pull' ? 'PULL' : 'DO NOTHING'}:</span>
                                        ) : (
                                            <span>{hoverState.vote.llm.name} says:</span>
                                        )}
                                    </div>

                                    {/* Save Status Indicator */}
                                    {hoverState.vote.audioUrl && (
                                        <div className="flex items-center gap-2" title={isProgressSaved ? "Progress Locked & Saved" : "Saving Progress..."}>
                                            {isProgressSaved ? (
                                                <svg className="w-4 h-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            ) : (
                                                <svg className="animate-spin w-4 h-4 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm md:text-base font-comic leading-tight dark:text-white">
                                    &quot;{hoverState.vote.reasoning}&quot;
                                </p>

                                {hoverState.vote.principles && hoverState.vote.principles.length > 0 && (
                                    <div className="mt-4 pt-4 border-t-2 border-dashed border-zinc-200 dark:border-zinc-600">
                                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">My Core Principles:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {hoverState.vote.principles.map((principle, i) => (
                                                <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded text-xs font-bold font-comic shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                                                    {principle}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
