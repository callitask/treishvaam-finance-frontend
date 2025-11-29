// src/components/AudioPlayer.js
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';

// NAMED EXPORT
export const AudioPlayer = ({ title, content }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const utteranceRef = useRef(null);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            setIsSupported(true);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const getTextFromHtml = (html) => {
        const tempDiv = document.createElement('div');
        // Replace block tags with spaces/newlines to ensure natural pauses
        let processedHtml = html
            .replace(/<\/p>/gi, '. ')
            .replace(/<\/h[1-6]>/gi, '. ')
            .replace(/<br\s*\/?>/gi, '. ')
            .replace(/<\/li>/gi, '. ');

        tempDiv.innerHTML = processedHtml;
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    const handlePlay = () => {
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            setIsPlaying(true);
            return;
        }

        window.speechSynthesis.cancel(); // Stop any previous speech

        const cleanText = `${title}. ${getTextFromHtml(content)}`;
        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Config (Optional: Adjustable pitch/rate)
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };

        // Error handling
        utterance.onerror = (e) => {
            console.error('Speech synthesis error:', e);
            setIsPlaying(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
    };

    const handlePause = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            setIsPaused(true);
            setIsPlaying(false);
        }
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
    };

    if (!isSupported) return null;

    return (
        <div className="flex items-center gap-4 bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 p-3 rounded-xl shadow-sm my-6 transition-colors duration-300">
            <div className="bg-sky-200 dark:bg-slate-700 p-2 rounded-full">
                <Volume2 size={20} className="text-sky-700 dark:text-sky-400" />
            </div>

            <div className="flex-1">
                <h4 className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider mb-0.5">
                    Listen to this story
                </h4>
                <p className="text-[10px] text-sky-600 dark:text-slate-400 font-medium">
                    {isPlaying ? 'Playing now...' : (isPaused ? 'Paused' : 'Audio Article')}
                </p>
            </div>

            <div className="flex items-center gap-2">
                {!isPlaying && !isPaused && (
                    <button
                        onClick={handlePlay}
                        className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full transition-colors shadow-sm"
                        aria-label="Play"
                    >
                        <Play size={16} fill="currentColor" />
                    </button>
                )}

                {isPaused && (
                    <button
                        onClick={handlePlay}
                        className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full transition-colors shadow-sm"
                        aria-label="Resume"
                    >
                        <Play size={16} fill="currentColor" />
                    </button>
                )}

                {isPlaying && (
                    <button
                        onClick={handlePause}
                        className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-colors shadow-sm"
                        aria-label="Pause"
                    >
                        <Pause size={16} fill="currentColor" />
                    </button>
                )}

                {(isPlaying || isPaused) && (
                    <button
                        onClick={handleStop}
                        className="p-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-full transition-colors"
                        aria-label="Stop"
                    >
                        <Square size={16} fill="currentColor" />
                    </button>
                )}
            </div>
        </div>
    );
};