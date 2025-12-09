'use client';

import React from 'react';

export default function TrolleyAnimation() {
    return (
        <div className="w-full bg-white text-black p-8 font-sans overflow-hidden border-b-2 border-zinc-200">
            <div className="max-w-4xl mx-auto relative aspect-[2/1]">
                <svg viewBox="0 0 800 400" className="w-full h-full drop-shadow-sm">
                    <defs>
                        <filter id="sketchy">
                            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                        </filter>
                    </defs>

                    <g stroke="black" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'url(#sketchy)' }}>
                        {/* Main Track coming from left */}
                        <path d="M -50 200 L 300 200" />
                        <path d="M -50 240 L 300 240" />

                        {/* Sleepers (ties) main */}
                        {Array.from({ length: 10 }).map((_, i) => (
                            <path key={`tie-main-${i}`} d={`M ${i * 40 - 40} 190 L ${i * 40 - 40} 250`} strokeWidth="2" />
                        ))}

                        {/* Top Track splitting */}
                        <path d="M 300 200 Q 450 200 600 100 L 850 100" />
                        <path d="M 300 240 Q 450 240 580 140 L 850 140" />

                        {/* Bottom Track splitting */}
                        <path d="M 300 240 Q 450 240 600 340 L 850 340" />
                        <path d="M 300 200 L 400 200 Q 450 200 480 230 L 580 300 L 850 300" /> {/* Approximate crossing */}

                        {/* Lever Guy */}
                        <g transform="translate(350, 250)">
                            {/* Head */}
                            <circle cx="0" cy="0" r="15" fill="white" />
                            {/* Body */}
                            <path d="M 0 15 L 0 60" />
                            {/* Legs */}
                            <path d="M 0 60 L -15 90" />
                            <path d="M 0 60 L 15 90" />
                            {/* Arms */}
                            <path d="M 0 30 L -20 50" />
                            <path d="M 0 30 L 20 40 L 30 20" /> {/* Holding lever */}

                            {/* Lever Base */}
                            <path d="M 40 80 L 60 80" />
                            <path d="M 50 80 L 50 70" />
                            <circle cx="50" cy="70" r="3" fill="black" />
                            {/* Lever Handle */}
                            <path d="M 50 70 L 30 20" strokeWidth="4" />
                        </g>

                        {/* Victims Top Track */}
                        <g transform="translate(650, 120)">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <g key={i} transform={`translate(${i * 25}, 0)`}>
                                    <path d="M 0 -10 L 0 10" strokeWidth="8" stroke="black" /> {/* Rope? */}
                                    <circle cx="0" cy="-15" r="8" fill="white" /> {/* Head */}
                                    <path d="M -5 5 L 5 5" /> {/* Body bound */}
                                </g>
                            ))}
                        </g>

                        {/* Victims Bottom Track */}
                        <g transform="translate(650, 320)">
                            <g>
                                <path d="M 0 -10 L 0 10" strokeWidth="8" stroke="black" />
                                <circle cx="0" cy="-15" r="8" fill="white" />
                                <path d="M -5 5 L 5 5" />
                            </g>
                        </g>

                        {/* The Trolley - Animated */}
                        <g className="animate-trolley-move">
                            <g transform="translate(0, 160)">
                                {/* Box */}
                                <rect x="0" y="0" width="160" height="100" fill="white" strokeWidth="4" rx="5" />
                                {/* Roof */}
                                <path d="M -10 0 L 170 0 L 160 -20 L 10 -20 Z" fill="white" strokeWidth="3" />
                                {/* Windows */}
                                <rect x="20" y="20" width="30" height="40" fill="white" />
                                <rect x="60" y="20" width="30" height="40" fill="white" />
                                <rect x="100" y="20" width="30" height="40" fill="white" />
                                {/* Wheels */}
                                <circle cx="40" cy="100" r="15" fill="white" strokeWidth="3">
                                    <animateTransform attributeName="transform" type="rotate" from="0 40 100" to="360 40 100" dur="1s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="120" cy="100" r="15" fill="white" strokeWidth="3">
                                    <animateTransform attributeName="transform" type="rotate" from="0 120 100" to="360 120 100" dur="1s" repeatCount="indefinite" />
                                </circle>
                            </g>
                        </g>

                    </g>
                </svg>

                {/* Labels */}
                <div className="absolute top-10 right-20 font-bold font-mono text-sm transform rotate-6 bg-white border border-black px-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    5 People
                </div>
                <div className="absolute bottom-20 right-20 font-bold font-mono text-sm transform -rotate-3 bg-white border border-black px-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    1 Person
                </div>
            </div>

            <style jsx>{`
                .animate-trolley-move {
                    animation: moveTrolley 4s linear infinite;
                }
                @keyframes moveTrolley {
                    0% { transform: translateX(-200px); }
                    40% { transform: translateX(250px); }
                    45% { transform: translateX(250px); } /* Pause briefly */
                    100% { transform: translateX(250px); } /* Stop at switch (or loop?) User wants loop probably. lets loop it passing through */
                } 
                /* Actually let's make it loop smoothly */
                 @keyframes moveTrolley {
                    0% { transform: translateX(-200px); }
                    100% { transform: translateX(300px); } /* Stop before splitting visually */
                }
            `}</style>
        </div>
    );
}
