/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useStore } from '@/features/game/state/store';

const TOOLTIPS = {
  move: {
    text: 'Toca para moverte',
    position: 'bottom-center' as const,
  },
  letters: {
    text: 'Recolecta todas las letras',
    position: 'top-center' as const,
  },
};

export const Onboarding: React.FC = () => {
  const {
    isOnboardingActive,
    onboardingStartTime,
    currentTooltip,
    dismissedTooltips,
    dismissTooltip,
    updateTooltip,
    collectedLetters,
    distance
  } = useStore();

  // Handle tooltip progression and dismissal
  useEffect(() => {
    if (!isOnboardingActive) return;

    const elapsed = Date.now() - onboardingStartTime;
    const isWithinTimeframe = elapsed < 60000; // 60 seconds

    if (!isWithinTimeframe) {
      // End onboarding after 60 seconds
      updateTooltip(null);
      return;
    }

    if (!currentTooltip) return;

    // Progress through tooltips based on actions
    if (currentTooltip === 'move' && distance > 5) {
      // Player moved, show letters tooltip
      dismissTooltip('move');
      updateTooltip('letters');
    } else if (currentTooltip === 'letters' && collectedLetters.length > 0) {
      // Player collected a letter, dismiss onboarding
      dismissTooltip('letters');
    }

    // Auto-dismiss tooltip after 10 seconds if not dismissed by action
    const timer = setTimeout(() => {
      if (currentTooltip) {
        dismissTooltip(currentTooltip);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [isOnboardingActive, currentTooltip, onboardingStartTime, distance, collectedLetters, dismissTooltip, updateTooltip]);

  if (!isOnboardingActive || !currentTooltip || dismissedTooltips.includes(currentTooltip)) {
    return null;
  }

  const tooltip = TOOLTIPS[currentTooltip as keyof typeof TOOLTIPS];
  if (!tooltip) return null;

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'bottom-center':
        return 'bottom-20 left-1/2 transform -translate-x-1/2';
      case 'top-center':
        return 'top-20 left-1/2 transform -translate-x-1/2';
      default:
        return 'bottom-20 left-1/2 transform -translate-x-1/2';
    }
  };

  return (
    <div className={`absolute ${getPositionClasses(tooltip.position)} z-40 pointer-events-none`}>
      <div className="bg-black/80 text-white px-4 py-2 rounded-lg border-2 border-yellow-400 shadow-lg animate-pulse">
        <div className="text-sm font-bold text-center">
          {tooltip.text}
        </div>
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-yellow-400 mx-auto mt-1"></div>
      </div>
    </div>
  );
};
