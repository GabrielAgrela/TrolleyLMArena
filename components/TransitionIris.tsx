'use client';

import { motion } from 'framer-motion';

export default function TransitionIris({
    isOpen,
    onCloseComplete
}: {
    isOpen: boolean;
    onCloseComplete?: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <mask id="hole-mask">
                        <rect width="100%" height="100%" fill="white" />
                        <motion.circle
                            cx="50%"
                            cy="50%"
                            fill="black"
                            initial={{ r: 0 }}
                            animate={{ r: isOpen ? "150%" : 0 }}
                            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                            onAnimationComplete={() => {
                                if (!isOpen && onCloseComplete) {
                                    onCloseComplete();
                                }
                            }}
                        />
                    </mask>
                </defs>
                <rect width="100%" height="100%" fill="black" mask="url(#hole-mask)" />
            </svg>
        </div>
    );
}
