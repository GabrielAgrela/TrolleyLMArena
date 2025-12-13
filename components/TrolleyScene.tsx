'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Vote = {
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

type OptionStyle = {
    left?: string;
    width?: string;
    maxWidth?: string;
    transform?: string;
    [key: string]: any;
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
    id: string; // Added ID
    title: string;
    text: string;
    humanPullVotes: number;
    humanNothingVotes: number;
    option1?: Option;
    option2?: Option;
};

import { useRouter, useSearchParams } from 'next/navigation';
import TransitionIris from './TransitionIris';

export default function TrolleyScene({ problem, votes, allProblems }: { problem: Problem, votes: Vote[], allProblems: { id: string, title: string }[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [hoverState, setHoverState] = useState<{ vote: Vote, y: number } | null>(null);
    const [windowHeight, setWindowHeight] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionDst, setTransitionDst] = useState<string | null>(null);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    // Reset transition when problem changes (using object ref to catch same-id refreshes)
    React.useEffect(() => {
        setIsTransitioning(false);
    }, [problem]);

    // FALLBACK IMAGE MAPPING
    const getSafeSrc = (src?: string) => {
        if (!src) return null;
        const validImages = [
            'five-guys', 'one-guy', 'four-guys', 'life-savings', 'mona-lisa',
            'lobsters', 'cat', 'brick-wall', 'yourself', 'rich-guy',
            'five-robots', 'one-baby', '50-2', '10-10', 'three-trolleys', 'one-trolley',
            'five-elderly', 'portal',
            'second-cousins', 'one-cousin'
        ];

        if (validImages.includes(src)) return src;

        // Map variations to base images
        if (src.includes('five-guys')) return 'five-guys';
        if (src.includes('one-guy')) return 'one-guy';
        if (src.includes('friend')) return 'one-guy';
        if (src.includes('cousin')) return 'one-guy';
        if (src.includes('clones')) return 'five-guys';
        if (src.includes('citizen')) return 'one-guy';
        if (src.includes('enemy')) return 'one-guy';
        // ... add other specific mappings as discovered

        return null; // Or return a 'mystery-box' placeholder if valid
    };

    const handleNextProblem = () => {
        // Find current problem index in the ordered list
        const currentIndex = allProblems.findIndex(p => p.id === problem.id);
        // Navigate to the next problem in sequence (wrap around)
        const nextIndex = (currentIndex + 1) % allProblems.length;
        const nextProblemId = allProblems[nextIndex].id;
        handleNavigate(`/browse?problemId=${nextProblemId}`);
    };

    const handleNavigate = (path: string) => {
        setTransitionDst(path);
        setIsTransitioning(true);
    };

    // Update window height
    React.useEffect(() => {
        setWindowHeight(window.innerHeight);
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Group votes for the sidebar
    const pullers = votes.filter(v => v.choice.toLowerCase() === 'pull');
    const bystanders = votes.filter(v => v.choice.toLowerCase() !== 'pull');

    // Add Humanity to the teams
    const humanChoice = problem.humanPullVotes > problem.humanNothingVotes ? 'pull' : 'nothing';
    const humanVote: Vote = {
        id: 'humanity',
        llm: { name: 'HUMANITY' }, // Accessing name directly for logic, sidebar adds icon via checking isHuman
        choice: humanChoice,
        reasoning: `${Math.round((Math.max(problem.humanPullVotes, problem.humanNothingVotes) / (problem.humanPullVotes + problem.humanNothingVotes || 1)) * 100)}% of humans chose to ${humanChoice} provided with this problem.`,
        principles: [] // No principles for humanity
    };

    if (humanChoice === 'pull') {
        pullers.unshift(humanVote);
    } else {
        bystanders.unshift(humanVote);
    }

    // Sort teams by Provider
    const sortByProvider = (a: Vote, b: Vote) => {
        if (a.id === 'humanity') return -1;
        if (b.id === 'humanity') return 1;
        const providerA = a.llm.provider?.name || 'zz';
        const providerB = b.llm.provider?.name || 'zz';
        return providerA.localeCompare(providerB) || a.llm.name.localeCompare(b.llm.name);
    };

    pullers.sort(sortByProvider);
    bystanders.sort(sortByProvider);

    const handleHover = (vote: Vote | null, e?: React.MouseEvent) => {
        if (vote && e) {
            const rect = e.currentTarget.getBoundingClientRect();
            // Calculate center y relative to the viewport/container
            const y = rect.top + (rect.height / 2);
            setHoverState({ vote, y });

            // Play audio if available
            playAudio(vote.audioUrl);
        } else {
            setHoverState(null);
            // Stop audio if exists
            if (audioRef.current) {
                saveCurrentProgress();
                audioRef.current.pause();
            }
            // Reset UI state
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            setIsProgressSaved(false);
        }
    };

    // Audio Logic
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioProgress = useRef<Record<string, number>>({});
    const playbackStartOffsetRef = useRef<number>(0);
    const currentUrlRef = useRef<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isProgressSaved, setIsProgressSaved] = useState(false); // UI State for save status
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

    const saveCurrentProgress = () => {
        if (audioRef.current && currentUrlRef.current) {
            // Only save if we've listened for more than 5 seconds
            const sessionDuration = audioRef.current.currentTime - playbackStartOffsetRef.current;
            if (sessionDuration > 5) {
                audioProgress.current[currentUrlRef.current] = audioRef.current.currentTime;
            }
        }
    };

    // Handle mute state changes
    React.useEffect(() => {
        if (isMuted) {
            if (audioRef.current) {
                saveCurrentProgress();
                audioRef.current.pause();
                if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                setIsProgressSaved(false);
            }
        } else {
            // Resume if we are currently hovering something with audio
            if (hoverState?.vote.audioUrl) {
                playAudio(hoverState.vote.audioUrl);
            }
        }
    }, [isMuted, hoverState?.vote.audioUrl]); // Added hoverState.vote.audioUrl to dependencies

    const playAudio = (url: string | null | undefined) => {
        if (!url || isMuted) return;

        // Save progress of currently playing audio (if any)
        saveCurrentProgress();
        if (audioRef.current) {
            audioRef.current.pause();
        }

        // Reset UI state
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        setIsProgressSaved(false);

        const audio = new Audio(url);

        // Restore progress if exists
        const savedTime = audioProgress.current[url] || 0;
        audio.currentTime = savedTime;
        playbackStartOffsetRef.current = savedTime;

        // Check if we are resuming from a "safe" point
        const isAlreadySaved = savedTime > 5;
        setIsProgressSaved(isAlreadySaved);

        // Only start the loading timer if it's NOT already saved
        if (!isAlreadySaved) {
            saveTimerRef.current = setTimeout(() => {
                setIsProgressSaved(true);
            }, 5000);
        }

        audioRef.current = audio;
        currentUrlRef.current = url;

        // Clean up progress when finished
        audio.addEventListener('ended', () => {
            if (audioProgress.current[url]) {
                delete audioProgress.current[url];
            }
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            setIsProgressSaved(false);
        });

        audio.play()
            .then(() => console.log("Audio playing:", url, "at", savedTime))
            .catch(err => console.error("Audio playback failed:", err));
    };

    // Smart Positioning Logic
    const bubbleRef = useRef<HTMLDivElement>(null);
    const [bubbleHeight, setBubbleHeight] = useState(0);

    useLayoutEffect(() => {
        if (bubbleRef.current) {
            setBubbleHeight(bubbleRef.current.offsetHeight);
        }
    }, [hoverState?.vote.id, hoverState?.y, windowHeight]);

    let bubbleTop = 0;
    let tailOffset = 0;

    if (hoverState && windowHeight > 0) {
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
        if (window.innerWidth < 768) {
            bubbleTop = windowHeight * 0.28;
        }

        // The tail needs to point to hoverState.y (the real target)
        const rawOffset = hoverState.y - bubbleTop;

        // Clamp the offset so the tail stays ON the bubble
        const maxDeviation = (bubbleHeight > 0 ? bubbleHeight / 2 : 100) - 30;
        tailOffset = Math.max(-maxDeviation, Math.min(maxDeviation, rawOffset));
    }

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-white text-black font-sans overflow-hidden">
            {/* Left Sidebar - LLM List */}
            <div className="w-full md:w-64 flex-shrink-0 border-r-0 md:border-r-2 border-t-2 md:border-t-0 border-black flex flex-col bg-zinc-50 h-[45vh] md:h-full order-2 md:order-first">
                <div className="p-4 border-b-2 border-black bg-white z-10">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                        <div>
                            <h2 className="font-bold text-xl font-comic leading-none">The Deciders</h2>
                            <div className="text-xs text-zinc-500 mt-1">Hover or tap to see logic</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Pullers Group */}
                    <div className="bg-green-50/50 rounded-xl p-3 border-2 border-green-200">
                        <div className="text-xs font-bold uppercase tracking-widest text-green-700 mb-3 font-comic flex items-center gap-2 border-b border-green-200 pb-2">
                            <span>✅</span> Team Pull ({pullers.length})
                        </div>
                        <div className="space-y-1">
                            {pullers.map(vote => (
                                <VoteItem key={vote.id} vote={vote} onHover={handleHover} />
                            ))}
                        </div>
                    </div>

                    {/* Bystanders Group */}
                    <div className="bg-red-50/50 rounded-xl p-3 border-2 border-red-200">
                        <div className="text-xs font-bold uppercase tracking-widest text-red-700 mb-3 font-comic flex items-center gap-2 border-b border-red-200 pb-2">
                            <span>🛑</span> Team Do Nothing ({bystanders.length})
                        </div>
                        <div className="space-y-1">
                            {bystanders.map(vote => (
                                <VoteItem key={vote.id} vote={vote} onHover={handleHover} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer / Home Link */}
                <div className="p-4 border-t-2 border-black bg-white space-y-3">
                    <button
                        onClick={() => handleNavigate('/')}
                        disabled={isTransitioning}
                        className="w-full py-3 bg-yellow-400 text-black font-black rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all font-comic uppercase tracking-widest text-sm relative group overflow-hidden flex items-center justify-center disabled:cursor-not-allowed"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <span>🏆</span> View Leaderboard <span>👑</span>
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>

                    <button
                        onClick={() => setIsSelectorOpen(true)}
                        disabled={isTransitioning}
                        className="w-full py-2 bg-white text-black font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all font-comic text-xs uppercase tracking-widest relative group overflow-hidden flex items-center justify-center disabled:cursor-not-allowed mb-2"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Select Problem 🔎
                        </span>
                    </button>

                    <button
                        onClick={handleNextProblem}
                        disabled={isTransitioning}
                        className="w-full py-3 bg-green-400 text-black font-black rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all font-comic uppercase tracking-widest text-sm relative group overflow-hidden flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Next Problem <span>🎲</span>
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                </div>
            </div>

            {/* PROBLEM SELECTOR MODAL */}
            <AnimatePresence>
                {isSelectorOpen && (
                    <motion.div
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSelectorOpen(false)}
                    >
                        <motion.div
                            className="bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b-2 border-black flex items-center justify-between bg-zinc-50">
                                <h2 className="text-2xl font-black font-comic">Select a Problem</h2>
                                <button onClick={() => setIsSelectorOpen(false)} className="text-2xl hover:scale-110 transition-transform">✖️</button>
                            </div>
                            <div className="overflow-y-auto p-4 space-y-2">
                                {allProblems.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            setIsSelectorOpen(false);
                                            handleNavigate(`/browse?problemId=${p.id}`);
                                        }}
                                        className={`w-full text-left p-4 rounded-xl border-2 border-black font-comic hover:bg-yellow-300 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all ${p.id === problem.id ? 'bg-yellow-100' : 'bg-white'}`}
                                    >
                                        <div className="font-bold text-lg">{p.title}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* IRIS TRANSITION OVERLAY */}
            {/* Always rendered, animating the circle radius */}
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
                {/* Mute Toggle */}
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-4 right-4 md:bottom-auto md:top-4 md:right-4 z-50 p-3 bg-white border-2 border-black rounded-full shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] transition-all"
                    title={isMuted ? "Unmute Audio" : "Mute Audio"}
                >
                    <span className="text-xl filter grayscale-0">
                        {isMuted ? "🔇" : "🔊"}
                    </span>
                </button>
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

                        // Standardized positions
                        // Index 0 = Option 1 = Straight/Bottom Track
                        // Index 1 = Option 2 = Divert/Top Track
                        const isOption1 = i === 0;

                        const baseStyle: React.CSSProperties = {
                            position: 'absolute',
                            left: '70%', // Moved further right
                            transformOrigin: 'center center',
                            maxWidth: opt.style?.maxWidth || '20%',
                            width: opt.style?.width,
                        };

                        // Track-specific adjustments
                        const trackStyle: React.CSSProperties = isOption1
                            ? { top: '60%', transform: 'translateY(-50%) rotate(10deg)' } // Bottom Track
                            : { top: '30%', transform: 'translateY(-50%) rotate(-5deg)' }; // Top Track

                        return (
                            <motion.img
                                key={i}
                                src={`/problem-images/${safeSrc}.png`}
                                style={{
                                    ...baseStyle,
                                    ...trackStyle,
                                    transformOrigin: 'center',
                                }}
                                className="pointer-events-none z-10 select-none"
                                alt=""
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: isOption1 ? 2.0 : 1.5, type: "spring", bounce: 0.4 }}
                            />
                        );
                    })}

                    {/* OVERLAY SVG FOR TEXT - Ensures text renders ON TOP of images (z-[100]) */}
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
                    <AnimatePresence>
                        {hoverState && (
                            <motion.div
                                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{ top: bubbleTop }}
                                className="absolute left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 -translate-y-1/2 w-[95%] md:w-full md:max-w-xl pointer-events-none z-50"
                            >
                                <div ref={bubbleRef} className="bg-white border-4 border-black rounded-[2rem] shadow-[4px_4px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_rgba(0,0,0,1)] relative ml-0 md:ml-4 flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                    {/* Speech Bubble Tail - Pointing Left (Attached to outer shell) */}
                                    <div style={{ transform: `translateY(${tailOffset}px)` }} className="hidden md:block absolute top-1/2 -left-6 -translate-y-1/2 w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[24px] border-r-black transition-transform duration-100 z-10"></div>
                                    <div style={{ transform: `translateY(${tailOffset}px)` }} className="hidden md:block absolute top-1/2 -left-[18px] -translate-y-1/2 w-0 h-0 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent border-r-[20px] border-r-white transition-transform duration-100 z-20"></div>

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
                                                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-wide">
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
                                                <p className="text-sm md:text-base font-comic leading-tight">
                                                    "{hoverState.vote.reasoning}"
                                                </p>

                                                {hoverState.vote.principles && hoverState.vote.principles.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t-2 border-dashed border-zinc-200">
                                                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">My Core Principles:</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {hoverState.vote.principles.map((principle, i) => (
                                                                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded text-xs font-bold font-comic shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
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
                        )}
                    </AnimatePresence>
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

function VoteItem({ vote, onHover }: { vote: Vote, onHover: (v: Vote | null, e?: React.MouseEvent) => void }) {
    const isHuman = vote.id === 'humanity';

    return (
        <button
            onMouseEnter={(e) => onHover(vote, e)}
            onMouseLeave={() => onHover(null)}
            className={`w-full text-left px-3 py-2 rounded transition-colors group flex items-center gap-2 ${isHuman
                ? 'bg-yellow-300 text-black hover:bg-yellow-400 font-black border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                : 'hover:bg-black hover:text-white'
                }`}
        >
            {isHuman ? (
                <div className="w-5 h-5 shrink-0 flex items-center justify-center text-base">
                    👥
                </div>
            ) : vote.llm.provider?.logoUrl ? (
                <div className="w-6 h-6 shrink-0 p-0.5 bg-white rounded-full border border-zinc-200 overflow-hidden flex items-center justify-center">
                    <img src={vote.llm.provider.logoUrl} alt="" className="w-full h-full object-contain" />
                </div>
            ) : (
                <div className="w-6 h-6 shrink-0 bg-zinc-900 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {vote.llm.name[0]}
                </div>
            )}

            <div className="flex-1 min-w-0">
                <span className={`font-comic text-sm block truncate ${isHuman ? 'uppercase tracking-wider' : 'font-bold text-zinc-900 group-hover:text-white'}`}>
                    {vote.llm.name}
                </span>
            </div>
        </button>
    );
}

function TrolleySVG({ hoveredChoice }: { hoveredChoice?: string }) {
    const isPull = hoveredChoice?.toLowerCase() === 'pull';
    const isNothing = hoveredChoice && !isPull;

    return (
        <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <filter id="wobbly">
                    <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                </filter>
            </defs>

            {/* TRACKS - with pop-up animation */}
            <motion.g
                stroke="black"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'url(#wobbly)', transformOrigin: 'center', transformBox: 'fill-box' }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5, type: "spring", bounce: 0.4 }}
            >
                {/* Main Track Ties (Diagonal Left part) */}
                <TrackTies
                    startT={0.02}
                    endT={0.98}
                    count={20}
                    rail1={{ type: 'line', p0: { x: -250, y: 100 }, p1: { x: 250, y: 250 } }}
                    rail2={{ type: 'line', p0: { x: -250, y: 150 }, p1: { x: 250, y: 300 } }}
                />

                {/* Pull Track Ties - Single smooth curve */}
                <TrackTies
                    startT={0.02}
                    endT={0.98}
                    count={20}
                    rail1={{ type: 'cubic', p0: { x: 250, y: 250 }, p1: { x: 400, y: 250 }, p2: { x: 500, y: 150 }, p3: { x: 850, y: 150 } }}
                    rail2={{ type: 'cubic', p0: { x: 250, y: 300 }, p1: { x: 400, y: 300 }, p2: { x: 480, y: 190 }, p3: { x: 850, y: 190 } }}
                />

                {/* Do Nothing Track Ties - Single smooth curve */}
                <TrackTies
                    startT={0.02}
                    endT={0.98}
                    count={20}
                    rail1={{ type: 'cubic', p0: { x: 250, y: 250 }, p1: { x: 350, y: 250 }, p2: { x: 450, y: 350 }, p3: { x: 850, y: 400 } }}
                    rail2={{ type: 'cubic', p0: { x: 250, y: 300 }, p1: { x: 350, y: 300 }, p2: { x: 400, y: 400 }, p3: { x: 850, y: 450 } }}
                />

                {/* Main Track Left (Diagonal Rails) */}
                <path d="M -250 100 L 250 250" />
                <path d="M -250 150 L 250 300" />

                {/* SWITCH POINT */}
                {/* Top Path (Divert/Pull) -> Kills 1/Few - Single smooth curve */}
                <path d="M 250 250 C 400 250, 500 150, 850 150" stroke={isPull ? "#22c55e" : "black"} strokeWidth={isPull ? 6 : 3} className="transition-all duration-300" />
                <path d="M 250 300 C 400 300, 480 190, 850 190" stroke={isPull ? "#22c55e" : "black"} strokeWidth={isPull ? 6 : 3} className="transition-all duration-300" />

                {/* Bottom Path (Straight/Nothing) -> Kills 5/Many - Single smooth curve */}
                <path d="M 250 250 C 350 250, 450 350, 850 400" stroke={isNothing ? "#ef4444" : "black"} strokeWidth={isNothing ? 6 : 3} className="transition-all duration-300" />
                <path d="M 250 300 C 350 300, 400 400, 850 450" stroke={isNothing ? "#ef4444" : "black"} strokeWidth={isNothing ? 6 : 3} className="transition-all duration-300" />
            </motion.g>

            {/* TROLLEY - Using logo image with pop-up */}
            <motion.g
                style={{ transformOrigin: '40px 80px' }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.0, type: "spring", bounce: 0.5 }}
            >
                <g className="animate-rumble">
                    <image
                        href="/logo.png"
                        x="-50"
                        y="-90"
                        width="180"
                        height="150"
                        preserveAspectRatio="xMidYMid meet"
                    />
                </g>
            </motion.g>

            {/* LEVER MAN with pop-up */}
            <motion.g
                stroke="black"
                strokeWidth="3"
                fill="none"
                style={{ filter: 'url(#wobbly)', transformOrigin: 'center', transformBox: 'fill-box' }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 2.5, type: "spring", bounce: 0.4 }}
            >
                <g transform="translate(300, 380)">
                    {/* Head */}
                    <circle cx="0" cy="0" r="15" fill="white" />
                    {/* Body */}
                    <path d="M 0 15 L 0 60" />
                    {/* Legs */}
                    <path d="M 0 60 L -15 90" />
                    <path d="M 0 60 L 15 90" />
                    {/* Arms */}
                    <path d="M 0 30 L -20 50" />
                    {/* Lever Arm */}
                    <path
                        d={isPull ? "M 0 30 L 30 50" : "M 0 30 L 15 50"}
                        className="transition-all duration-300"
                    />

                    {/* LEVER BASE */}
                    <g transform="translate(40, 60)">
                        <path d="M 0 30 L 20 30" />
                        <path d="M 10 30 L 10 20" />
                        <circle cx="10" cy="20" r="3" fill="black" />
                        {/* HANDLE */}
                        <path
                            d={isPull ? "M 10 20 L -20 -30" : "M 10 20 L 30 -30"}
                            strokeWidth="4"
                            className="transition-all duration-300 ease-spring"
                        />
                    </g>
                </g>
            </motion.g>

            <style>
                {`
                .animate-rumble {
                    animation: rumble 0.5s ease-in-out infinite alternate;
                }
                @keyframes rumble {
                    from { transform: translate(50px, 200px) rotate(0deg); }
                    to { transform: translate(50px, 198px) rotate(0.5deg); }
                }
                .ease-spring {
                    transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
            `}
            </style>
        </svg>
    );
}

// --- Track Tie Helpers ---

type Point = { x: number, y: number };
type RailDef =
    | { type: 'line', p0: Point, p1: Point }
    | { type: 'quad', p0: Point, p1: Point, p2: Point }
    | { type: 'cubic', p0: Point, p1: Point, p2: Point, p3: Point };

function getPointOnRail(rail: RailDef, t: number): Point {
    if (rail.type === 'line') {
        return {
            x: rail.p0.x + t * (rail.p1.x - rail.p0.x),
            y: rail.p0.y + t * (rail.p1.y - rail.p0.y)
        };
    } else if (rail.type === 'quad') {
        const oneMinusT = 1 - t;
        return {
            x: oneMinusT * oneMinusT * rail.p0.x + 2 * oneMinusT * t * rail.p1.x + t * t * rail.p2.x,
            y: oneMinusT * oneMinusT * rail.p0.y + 2 * oneMinusT * t * rail.p1.y + t * t * rail.p2.y
        };
    } else if (rail.type === 'cubic') {
        // Cubic Bezier: B(t) = (1-t)^3*P0 + 3*(1-t)^2*t*P1 + 3*(1-t)*t^2*P2 + t^3*P3
        const oneMinusT = 1 - t;
        const oneMinusT2 = oneMinusT * oneMinusT;
        const oneMinusT3 = oneMinusT2 * oneMinusT;
        const t2 = t * t;
        const t3 = t2 * t;
        return {
            x: oneMinusT3 * rail.p0.x + 3 * oneMinusT2 * t * rail.p1.x + 3 * oneMinusT * t2 * rail.p2.x + t3 * rail.p3.x,
            y: oneMinusT3 * rail.p0.y + 3 * oneMinusT2 * t * rail.p1.y + 3 * oneMinusT * t2 * rail.p2.y + t3 * rail.p3.y
        };
    }
    return { x: 0, y: 0 };
}

function TrackTies({ rail1, rail2, count, startT = 0, endT = 1 }: { rail1: RailDef, rail2: RailDef, count: number, startT?: number, endT?: number }) {
    return (
        <g>
            {Array.from({ length: count }).map((_, i) => {
                const step = (endT - startT) / count;
                const t = startT + (i * step) + (step / 2); // Sample middle of segment? Or linear.
                // Let's just linear
                const tActual = startT + (i / (count - 1 || 1)) * (endT - startT);

                const p1 = getPointOnRail(rail1, tActual);
                const p2 = getPointOnRail(rail2, tActual);

                // Extend slightly past rails
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const angle = Math.atan2(dy, dx);
                const ext = 4; // Extension length

                const x1 = p1.x - Math.cos(angle) * ext;
                const y1 = p1.y - Math.sin(angle) * ext;
                const x2 = p2.x + Math.cos(angle) * ext;
                const y2 = p2.y + Math.sin(angle) * ext;

                return (
                    <path key={i} d={`M ${x1} ${y1} L ${x2} ${y2}`} strokeWidth="2" stroke="black" />
                );
            })}
        </g>
    )
}
