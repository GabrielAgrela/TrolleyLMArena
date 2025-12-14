'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import TransitionIris from './TransitionIris';
import ThemeToggle from './ThemeToggle';
import {
    TeamSidebar,
    SceneControls,
    ProblemSelectorModal,
    TrolleySVG,
    ReasoningBubble,
    useAudioPlayer,
    type TrolleyVote
} from './trolley';

type OptionStyle = {
    left?: string;
    width?: string;
    maxWidth?: string;
    transform?: string;
    [key: string]: string | undefined;
};

type Option = {
    kill?: number;
    src?: string;
    style?: OptionStyle;
    sound?: string;
    volume?: number;
    hide?: boolean;
    text?: string;
};

type Problem = {
    id: string;
    title: string;
    text: string;
    humanPullVotes: number;
    humanNothingVotes: number;
    option1?: Option;
    option2?: Option;
};

// FALLBACK IMAGE MAPPING
const VALID_IMAGES = [
    'five-guys', 'one-guy', 'four-guys', 'life-savings', 'mona-lisa',
    'lobsters', 'cat', 'brick-wall', 'yourself', 'rich-guy',
    'five-robots', 'one-baby', '50-2', '10-10', 'three-trolleys', 'one-trolley',
    'five-elderly', 'portal', 'second-cousins', 'one-cousin'
];

function getSafeSrc(src?: string): string | null {
    if (!src) return null;
    if (VALID_IMAGES.includes(src)) return src;

    // Map variations to base images
    if (src.includes('five-guys')) return 'five-guys';
    if (src.includes('one-guy')) return 'one-guy';
    if (src.includes('friend')) return 'one-guy';
    if (src.includes('cousin')) return 'one-guy';
    if (src.includes('clones')) return 'five-guys';
    if (src.includes('citizen')) return 'one-guy';
    if (src.includes('enemy')) return 'one-guy';

    return null;
}

// Sort team members by provider name
function sortByProvider(a: TrolleyVote, b: TrolleyVote): number {
    if (a.id === 'humanity') return -1;
    if (b.id === 'humanity') return 1;
    const providerA = a.llm.provider?.name || 'zz';
    const providerB = b.llm.provider?.name || 'zz';
    return providerA.localeCompare(providerB) || a.llm.name.localeCompare(b.llm.name);
}

export default function TrolleyScene({
    problem,
    votes,
    allProblems
}: {
    problem: Problem;
    votes: TrolleyVote[];
    allProblems: { id: string; title: string }[];
}) {
    const router = useRouter();

    // State
    const [hoverState, setHoverState] = useState<{ vote: TrolleyVote; y: number } | null>(null);
    const [windowHeight, setWindowHeight] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionDst, setTransitionDst] = useState<string | null>(null);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    // Audio
    const { isMuted, setIsMuted, isProgressSaved, playAudio, pauseAndSave, resetState } = useAudioPlayer();

    // Reset transition when problem changes
    useEffect(() => {
        setIsTransitioning(false);
    }, [problem]);

    // Update window height
    useEffect(() => {
        setWindowHeight(window.innerHeight);
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle mute state changes
    useEffect(() => {
        if (isMuted) {
            pauseAndSave();
        } else if (hoverState?.vote.audioUrl) {
            playAudio(hoverState.vote.audioUrl);
        }
    }, [isMuted, hoverState?.vote.audioUrl, pauseAndSave, playAudio]);

    // Group votes for the sidebar
    const humanChoice = problem.humanPullVotes > problem.humanNothingVotes ? 'pull' : 'nothing';
    const humanVote: TrolleyVote = {
        id: 'humanity',
        llm: { name: 'HUMANITY' },
        choice: humanChoice,
        reasoning: `${Math.round((Math.max(problem.humanPullVotes, problem.humanNothingVotes) / (problem.humanPullVotes + problem.humanNothingVotes || 1)) * 100)}% of humans chose to ${humanChoice} provided with this problem.`,
        principles: []
    };

    const pullers = votes.filter(v => v.choice.toLowerCase() === 'pull');
    const bystanders = votes.filter(v => v.choice.toLowerCase() !== 'pull');

    if (humanChoice === 'pull') {
        pullers.unshift(humanVote);
    } else {
        bystanders.unshift(humanVote);
    }

    pullers.sort(sortByProvider);
    bystanders.sort(sortByProvider);

    // Handlers
    const handleNavigate = (path: string) => {
        setTransitionDst(path);
        setIsTransitioning(true);
    };

    const handleNextProblem = () => {
        const currentIndex = allProblems.findIndex(p => p.id === problem.id);
        const nextIndex = (currentIndex + 1) % allProblems.length;
        const nextProblemId = allProblems[nextIndex].id;
        handleNavigate(`/browse?problemId=${nextProblemId}`);
    };

    const handleHover = (vote: TrolleyVote | null, e?: React.MouseEvent) => {
        if (vote && e) {
            const rect = e.currentTarget.getBoundingClientRect();
            const y = rect.top + (rect.height / 2);
            setHoverState({ vote, y });
            playAudio(vote.audioUrl);
        } else {
            setHoverState(null);
            pauseAndSave();
            resetState();
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-white dark:bg-zinc-950 text-black dark:text-white font-sans overflow-hidden">
            {/* Left Sidebar - LLM List */}
            <div className="w-full md:w-64 flex-shrink-0 border-r-0 md:border-r-2 border-t-2 md:border-t-0 border-black dark:border-zinc-700 flex flex-col bg-zinc-50 dark:bg-zinc-900 h-[45vh] md:h-full order-2 md:order-first">
                <div className="p-4 border-b-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 z-10">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
                        <div>
                            <h2 className="font-bold text-xl font-comic leading-none">The Deciders</h2>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Hover or tap to see logic</div>
                        </div>
                    </div>
                </div>

                <TeamSidebar pullers={pullers} bystanders={bystanders} onHover={handleHover} />

                <SceneControls
                    onViewLeaderboard={() => handleNavigate('/')}
                    onSelectProblem={() => setIsSelectorOpen(true)}
                    onNextProblem={handleNextProblem}
                    isDisabled={isTransitioning}
                />
            </div>

            <ProblemSelectorModal
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                problems={allProblems}
                currentProblemId={problem.id}
                onSelectProblem={(id) => handleNavigate(`/browse?problemId=${id}`)}
            />

            {/* IRIS TRANSITION OVERLAY */}
            <TransitionIris
                isOpen={!isTransitioning}
                onCloseComplete={() => {
                    if (transitionDst) {
                        router.push(transitionDst);
                    } else {
                        router.refresh();
                    }
                }}
            />

            {/* Main Stage - The Sketch */}
            <div className="flex-1 relative flex flex-col h-[55vh] md:h-full order-1 md:order-none">
                {/* Control Buttons - Top Right */}
                <div className="absolute bottom-4 right-4 md:bottom-auto md:top-4 md:right-4 z-50 flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-3 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-600 rounded-full shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] transition-all"
                        title={isMuted ? "Unmute Audio" : "Mute Audio"}
                    >
                        <span className="text-xl filter grayscale-0">
                            {isMuted ? "🔇" : "🔊"}
                        </span>
                    </button>
                </div>

                {/* Problem Text Header */}
                <div className="absolute top-0 left-0 right-0 p-4 md:p-8 text-center pointer-events-none z-10">
                    <h1 className="text-xl md:text-4xl font-black font-comic mb-2 md:mb-4 leading-tight">{problem.title}</h1>
                    <p className="text-sm md:text-2xl font-comic max-w-4xl mx-auto leading-relaxed line-clamp-3 md:line-clamp-none">
                        {problem.text}
                    </p>

                    {/* Human Consensus Sticker */}
                    <div className="inline-block mt-2 md:mt-4 bg-[#ffeb3b] text-black border-2 border-black px-2 md:px-4 py-1 md:py-2 transform -rotate-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                        <span className="font-bold font-comic uppercase tracking-widest text-[10px] md:text-sm block text-zinc-600 mb-0 md:mb-1">Human Consensus</span>
                        <span className="font-black font-comic text-sm md:text-xl">
                            {problem.humanPullVotes > problem.humanNothingVotes ? 'PULL' : 'NOTHING'}
                            {' '}
                            ({Math.round((Math.max(problem.humanPullVotes, problem.humanNothingVotes) / (problem.humanPullVotes + problem.humanNothingVotes || 1)) * 100)}%)
                        </span>
                    </div>
                </div>

                {/* The SVG Scene */}
                <div className="flex-1 w-full h-full relative">
                    <TrolleySVG hoveredChoice={hoverState?.vote.choice} />

                    {/* Render Problem Options with Standardized Positioning */}
                    {[problem.option1, problem.option2].map((opt, i) => {
                        const safeSrc = getSafeSrc(opt?.src);
                        if (!opt || opt.hide || !safeSrc) return null;

                        const isOption1 = i === 0;

                        const baseStyle: React.CSSProperties = {
                            position: 'absolute',
                            left: '70%',
                            transformOrigin: 'center center',
                            maxWidth: opt.style?.maxWidth || '20%',
                            width: opt.style?.width,
                        };

                        const trackStyle: React.CSSProperties = isOption1
                            ? { top: '60%', transform: 'translateY(-50%) rotate(10deg)' }
                            : { top: '30%', transform: 'translateY(-50%) rotate(-5deg)' };

                        return (
                            <motion.img
                                key={i}
                                src={`/problem-images/${safeSrc}.png`}
                                style={{ ...baseStyle, ...trackStyle, transformOrigin: 'center' }}
                                className="pointer-events-none z-10 select-none dark:invert"
                                alt=""
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: isOption1 ? 2.0 : 1.5, type: "spring", bounce: 0.4 }}
                            />
                        );
                    })}

                    {/* OVERLAY SVG FOR TEXT */}
                    <div className="absolute inset-0 pointer-events-none z-[100]">
                        <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                            {hoverState?.vote.choice && (
                                <text
                                    x="600"
                                    y={hoverState.vote.choice.toLowerCase() === 'pull' ? "200" : "400"}
                                    textAnchor="middle"
                                    className="font-comic font-bold uppercase"
                                    style={{ fontSize: '42px', fill: 'white', stroke: 'black', strokeWidth: 3, paintOrder: 'stroke fill' }}
                                >
                                    {hoverState.vote.choice.toLowerCase() === 'pull' ? "PULL!" : "DO NOTHING!"}
                                </text>
                            )}
                        </svg>
                    </div>

                    {/* Reasoning Bubble Overlay */}
                    <ReasoningBubble
                        hoverState={hoverState}
                        windowHeight={windowHeight}
                        isProgressSaved={isProgressSaved}
                    />
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,400&display=swap');
                
                .font-comic {
                    font-family: 'Comic Neue', 'Comic Sans MS', cursive, sans-serif;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
