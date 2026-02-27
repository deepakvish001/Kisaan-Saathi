import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import type { Language } from '../lib/translations';

interface VoiceInputProps {
  language: Language;
  onTranscript: (text: string) => void;
  onRecordingChange?: (isRecording: boolean) => void;
}

const translations = {
  en: {
    startRecording: 'Tap to speak',
    stopRecording: 'Stop recording',
    listening: 'Listening...',
    processing: 'Processing...',
    notSupported: 'Voice input not supported in this browser',
    permissionDenied: 'Microphone permission denied',
  },
  hi: {
    startRecording: 'बोलने के लिए टैप करें',
    stopRecording: 'रिकॉर्डिंग बंद करें',
    listening: 'सुन रहे हैं...',
    processing: 'प्रोसेसिंग...',
    notSupported: 'इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है',
    permissionDenied: 'माइक्रोफ़ोन अनुमति अस्वीकृत',
  },
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function VoiceInput({ language, onTranscript, onRecordingChange }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const t = translations[language];

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
      onRecordingChange?.(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsProcessing(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);

      if (event.error === 'not-allowed') {
        setError(t.permissionDenied);
      } else {
        setError('Error recognizing speech');
      }

      setIsRecording(false);
      setIsProcessing(false);
      onRecordingChange?.(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessing(false);
      onRecordingChange?.(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onTranscript, onRecordingChange, t.permissionDenied]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsProcessing(true);
    } else {
      setError(null);
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognitionRef.current.start();
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center py-4">
        <MicOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">{t.notSupported}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={toggleRecording}
        disabled={isProcessing}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all transform active:scale-95 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50'
            : isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl'
        }`}
        aria-label={isRecording ? t.stopRecording : t.startRecording}
      >
        {isRecording ? (
          <Volume2 className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}

        {isRecording && (
          <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping"></span>
        )}
      </button>

      <div className="text-center min-h-[24px]">
        {isRecording && (
          <p className="text-sm font-semibold text-red-600 animate-pulse">
            {t.listening}
          </p>
        )}
        {isProcessing && (
          <p className="text-sm font-semibold text-gray-600">
            {t.processing}
          </p>
        )}
        {!isRecording && !isProcessing && !error && (
          <p className="text-sm text-gray-500">
            {t.startRecording}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 font-semibold">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
