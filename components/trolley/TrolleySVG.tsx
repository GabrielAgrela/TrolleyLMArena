'use client';

import { motion } from 'framer-motion';
import { TrackTies } from './TrackHelpers';

type TrolleySVGProps = {
    hoveredChoice?: string;
};

export default function TrolleySVG({ hoveredChoice }: TrolleySVGProps) {
    const isPull = hoveredChoice?.toLowerCase() === 'pull';
    const isNothing = hoveredChoice && !isPull;

    return (
        <svg viewBox="0 0 800 500" className="w-full h-full dark:invert" preserveAspectRatio="xMidYMid meet">
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
