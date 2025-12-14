'use client';

import { useState, useRef, useCallback } from 'react';

type AudioPlayerState = {
    isMuted: boolean;
    isProgressSaved: boolean;
};

type UseAudioPlayerReturn = {
    isMuted: boolean;
    setIsMuted: (muted: boolean) => void;
    isProgressSaved: boolean;
    playAudio: (url: string | null | undefined) => void;
    pauseAndSave: () => void;
    resetState: () => void;
};

export function useAudioPlayer(): UseAudioPlayerReturn {
    const [isMuted, setIsMuted] = useState(false);
    const [isProgressSaved, setIsProgressSaved] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioProgress = useRef<Record<string, number>>({});
    const playbackStartOffsetRef = useRef<number>(0);
    const currentUrlRef = useRef<string | null>(null);
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

    const saveCurrentProgress = useCallback(() => {
        if (audioRef.current && currentUrlRef.current) {
            // Only save if we've listened for more than 5 seconds
            const sessionDuration = audioRef.current.currentTime - playbackStartOffsetRef.current;
            if (sessionDuration > 5) {
                audioProgress.current[currentUrlRef.current] = audioRef.current.currentTime;
            }
        }
    }, []);

    const pauseAndSave = useCallback(() => {
        saveCurrentProgress();
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }
        setIsProgressSaved(false);
    }, [saveCurrentProgress]);

    const resetState = useCallback(() => {
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }
        setIsProgressSaved(false);
    }, []);

    const playAudio = useCallback((url: string | null | undefined) => {
        if (!url || isMuted) return;

        // Save progress of currently playing audio (if any)
        saveCurrentProgress();
        if (audioRef.current) {
            audioRef.current.pause();
        }

        // Reset UI state
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }
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
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
            setIsProgressSaved(false);
        });

        audio.play()
            .then(() => console.log("Audio playing:", url, "at", savedTime))
            .catch(err => console.error("Audio playback failed:", err));
    }, [isMuted, saveCurrentProgress]);

    return {
        isMuted,
        setIsMuted,
        isProgressSaved,
        playAudio,
        pauseAndSave,
        resetState
    };
}
