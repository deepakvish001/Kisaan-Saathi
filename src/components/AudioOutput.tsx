import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause } from 'lucide-react';
import type { Language } from '../lib/translations';

interface AudioOutputProps {
  text: string;
  language: Language;
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

const translations = {
  en: {
    play: 'Play audio',
    pause: 'Pause audio',
    stop: 'Stop audio',
    speaking: 'Speaking...',
    notSupported: 'Audio not supported',
  },
  hi: {
    play: 'ऑडियो चलाएं',
    pause: 'ऑडियो रोकें',
    stop: 'ऑडियो बंद करें',
    speaking: 'बोल रहा है...',
    notSupported: 'ऑडियो समर्थित नहीं है',
  },
};

export function AudioOutput({
  text,
  language,
  autoPlay = false,
  showControls = true,
  className = '',
}: AudioOutputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const t = translations[language];

  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    if (autoPlay && text) {
      speak();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text, autoPlay]);

  const speak = () => {
    if (!window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const togglePlayPause = () => {
    if (!isSpeaking) {
      speak();
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  if (!isSupported || !showControls) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={togglePlayPause}
        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
        aria-label={isPaused ? t.play : isSpeaking ? t.pause : t.play}
        title={isPaused ? t.play : isSpeaking ? t.pause : t.play}
      >
        {isSpeaking && !isPaused ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>

      {isSpeaking && (
        <button
          onClick={stop}
          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
          aria-label={t.stop}
          title={t.stop}
        >
          <VolumeX className="w-4 h-4" />
        </button>
      )}

      {isSpeaking && !isPaused && (
        <span className="text-xs text-blue-600 font-semibold animate-pulse">
          {t.speaking}
        </span>
      )}
    </div>
  );
}
