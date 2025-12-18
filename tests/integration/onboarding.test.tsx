/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useStore } from '@/features/game/state/store';
import { Onboarding } from '@/features/ui/onboarding';

// Mock the store
vi.mock('@/features/game/state/store', () => ({
  useStore: vi.fn(),
}));

const mockUseStore = vi.mocked(useStore);

describe('Onboarding System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when onboarding is not active', () => {
    mockUseStore.mockReturnValue({
      isOnboardingActive: false,
      onboardingStartTime: 0,
      currentTooltip: null,
      dismissedTooltips: [],
      dismissTooltip: vi.fn(),
      updateTooltip: vi.fn(),
      collectedLetters: [],
      distance: 0,
    });

    render(<Onboarding />);

    expect(screen.queryByText('Toca para moverte')).not.toBeInTheDocument();
    expect(screen.queryByText('Recolecta todas las letras')).not.toBeInTheDocument();
  });

  it('should not render when tooltip is dismissed', () => {
    mockUseStore.mockReturnValue({
      isOnboardingActive: true,
      onboardingStartTime: Date.now(),
      currentTooltip: 'move',
      dismissedTooltips: ['move'],
      dismissTooltip: vi.fn(),
      updateTooltip: vi.fn(),
      collectedLetters: [],
      distance: 0,
    });

    render(<Onboarding />);

    expect(screen.queryByText('Toca para moverte')).not.toBeInTheDocument();
  });

  it('should render move tooltip when active', () => {
    mockUseStore.mockReturnValue({
      isOnboardingActive: true,
      onboardingStartTime: Date.now(),
      currentTooltip: 'move',
      dismissedTooltips: [],
      dismissTooltip: vi.fn(),
      updateTooltip: vi.fn(),
      collectedLetters: [],
      distance: 0,
    });

    render(<Onboarding />);

    expect(screen.getByText('Toca para moverte')).toBeInTheDocument();
  });

  it('should render letters tooltip when active', () => {
    mockUseStore.mockReturnValue({
      isOnboardingActive: true,
      onboardingStartTime: Date.now(),
      currentTooltip: 'letters',
      dismissedTooltips: [],
      dismissTooltip: vi.fn(),
      updateTooltip: vi.fn(),
      collectedLetters: [],
      distance: 0,
    });

    render(<Onboarding />);

    expect(screen.getByText('Recolecta todas las letras')).toBeInTheDocument();
  });

  it('should progress from move to letters tooltip when player moves', async () => {
    const mockDismissTooltip = vi.fn();
    const mockUpdateTooltip = vi.fn();

    mockUseStore.mockReturnValue({
      isOnboardingActive: true,
      onboardingStartTime: Date.now(),
      currentTooltip: 'move',
      dismissedTooltips: [],
      dismissTooltip: mockDismissTooltip,
      updateTooltip: mockUpdateTooltip,
      collectedLetters: [],
      distance: 0,
    });

    const { rerender } = render(<Onboarding />);

    // Initially shows move tooltip
    expect(screen.getByText('Toca para moverte')).toBeInTheDocument();

    // Simulate player movement
    mockUseStore.mockReturnValue({
      isOnboardingActive: true,
      onboardingStartTime: Date.now(),
      currentTooltip: 'move',
      dismissedTooltips: [],
      dismissTooltip: mockDismissTooltip,
      updateTooltip: mockUpdateTooltip,
      collectedLetters: [],
      distance: 10, // Moved more than 5 units
    });

    rerender(<Onboarding />);

    // Wait for the effect to run
    await waitFor(() => {
      expect(mockDismissTooltip).toHaveBeenCalledWith('move');
      expect(mockUpdateTooltip).toHaveBeenCalledWith('letters');
    });
  });

  it('should dismiss letters tooltip when player collects a letter', async () => {
    const mockDismissTooltip = vi.fn();
    const mockUpdateTooltip = vi.fn();

    mockUseStore.mockReturnValue({
      isOnboardingActive: true,
      onboardingStartTime: Date.now(),
      currentTooltip: 'letters',
      dismissedTooltips: [],
      dismissTooltip: mockDismissTooltip,
      updateTooltip: mockUpdateTooltip,
      collectedLetters: [],
      distance: 10,
    });

    const { rerender } = render(<Onboarding />);

    // Initially shows letters tooltip
    expect(screen.getByText('Recolecta todas las letras')).toBeInTheDocument();

    // Simulate collecting a letter
    mockUseStore.mockReturnValue({
      isOnboardingActive: true,
      onboardingStartTime: Date.now(),
      currentTooltip: 'letters',
      dismissedTooltips: [],
      dismissTooltip: mockDismissTooltip,
      updateTooltip: mockUpdateTooltip,
      collectedLetters: [0], // Collected first letter
      distance: 10,
    });

    rerender(<Onboarding />);

    // Wait for the effect to run
    await waitFor(() => {
      expect(mockDismissTooltip).toHaveBeenCalledWith('letters');
    });
  });

  it('should auto-dismiss tooltip after 10 seconds', async () => {
    const mockDismissTooltip = vi.fn();

    mockUseStore.mockReturnValue({
      isOnboardingActive: true,
      onboardingStartTime: Date.now(),
      currentTooltip: 'move',
      dismissedTooltips: [],
      dismissTooltip: mockDismissTooltip,
      updateTooltip: vi.fn(),
      collectedLetters: [],
      distance: 0,
    });

    render(<Onboarding />);

    expect(screen.getByText('Toca para moverte')).toBeInTheDocument();

    // Wait for auto-dismiss timer (11 seconds to be safe)
    await waitFor(() => {
      expect(mockDismissTooltip).toHaveBeenCalledWith('move');
    }, { timeout: 12000 });
  }, 13000);

  it('should not show tooltips after 60 seconds from start', async () => {
    const sixtySecondsAgo = Date.now() - 61000;
    const mockUpdateTooltip = vi.fn();

    mockUseStore.mockReturnValue({
      isOnboardingActive: true,
      onboardingStartTime: sixtySecondsAgo,
      currentTooltip: 'move',
      dismissedTooltips: [],
      dismissTooltip: vi.fn(),
      updateTooltip: mockUpdateTooltip,
      collectedLetters: [],
      distance: 0,
    });

    render(<Onboarding />);

    // Initially might show, but should dismiss after effect runs
    await waitFor(() => {
      expect(mockUpdateTooltip).toHaveBeenCalledWith(null);
    }, { timeout: 100 });
  });
});
