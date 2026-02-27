import { Sprout } from 'lucide-react';

export type AssistantState = 'idle' | 'listening' | 'thinking' | 'suggesting';

interface AssistantAvatarProps {
  state: AssistantState;
  size?: 'sm' | 'md' | 'lg';
}

export function AssistantAvatar({ state, size = 'md' }: AssistantAvatarProps) {
  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const stateColors = {
    idle: 'from-emerald-500 via-teal-500 to-lime-400',
    listening: 'from-blue-500 via-cyan-500 to-teal-400',
    thinking: 'from-amber-500 via-orange-500 to-yellow-400',
    suggesting: 'from-emerald-500 via-green-500 to-teal-400',
  };

  const glowColors = {
    idle: 'shadow-emerald-400',
    listening: 'shadow-blue-400',
    thinking: 'shadow-amber-400',
    suggesting: 'shadow-emerald-400',
  };

  const ringColors = {
    idle: 'bg-emerald-400',
    listening: 'bg-blue-400',
    thinking: 'bg-amber-400',
    suggesting: 'bg-emerald-400',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} bg-gradient-to-br ${stateColors[state]} rounded-3xl shadow-2xl ${glowColors[state]} flex items-center justify-center transition-all duration-500 transform hover:scale-110 hover:rotate-6 ${
            state !== 'idle' ? 'animate-pulse' : ''
          }`}
        >
          <Sprout className={`${iconSizes[size]} text-white drop-shadow-lg ${state === 'thinking' ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
        </div>

        {state !== 'idle' && (
          <>
            <div className={`absolute inset-0 rounded-3xl ${ringColors[state]} opacity-20 animate-ping`} style={{ animationDuration: '1.5s' }}></div>
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${stateColors[state]} blur-2xl opacity-40`}></div>
          </>
        )}
      </div>

      {state !== 'idle' && (
        <div className="flex gap-2">
          <div className={`w-2.5 h-2.5 ${ringColors[state]} rounded-full`} style={{ animation: 'bounce-smooth 1s infinite', animationDelay: '0ms' }} />
          <div className={`w-2.5 h-2.5 ${ringColors[state]} rounded-full`} style={{ animation: 'bounce-smooth 1s infinite', animationDelay: '200ms' }} />
          <div className={`w-2.5 h-2.5 ${ringColors[state]} rounded-full`} style={{ animation: 'bounce-smooth 1s infinite', animationDelay: '400ms' }} />
        </div>
      )}
    </div>
  );
}
