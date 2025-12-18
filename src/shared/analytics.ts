/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Analytics & Telemetry System
 * Privacy-focused event tracking for game insights
 */

export interface AnalyticsEvent {
  name: string;
  props?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  domain?: string;
  apiHost?: string;
  trackLocalhost?: boolean;
}

// Generate anonymous user ID (privacy-compliant)
function getUserId(): string {
  const storageKey = 'calamar_user_id';
  let userId = localStorage.getItem(storageKey);

  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(storageKey, userId);
  }

  return userId;
}

// Generate session ID
function getSessionId(): string {
  const storageKey = 'calamar_session_id';
  let sessionId = localStorage.getItem(storageKey);
  const lastActivity = localStorage.getItem('calamar_last_activity');
  const now = Date.now();
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes

  // Start new session if no session exists or timeout exceeded
  if (!sessionId || !lastActivity || (now - parseInt(lastActivity)) > sessionTimeout) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(storageKey, sessionId);
  }

  localStorage.setItem('calamar_last_activity', now.toString());
  return sessionId;
}

// Get device info (non-PII)
function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    devicePixelRatio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer || 'direct'
  };
}

class AnalyticsTracker {
  private config: AnalyticsConfig;
  private userId: string;
  private sessionId: string;
  private eventsQueue: AnalyticsEvent[] = [];
  private flushInterval: number | null = null;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.userId = getUserId();
    this.sessionId = getSessionId();

    // Auto-flush events every 30 seconds
    if (config.enabled) {
      this.flushInterval = window.setInterval(() => {
        this.flush();
      }, 30000);
    }
  }

  /**
   * Track an analytics event
   */
  track(eventName: string, props: Record<string, any> = {}): void {
    if (!this.config.enabled) return;

    // Skip localhost tracking unless explicitly enabled
    if (window.location.hostname === 'localhost' && !this.config.trackLocalhost) {
      console.log(`[Analytics] ${eventName}`, props);
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      props: {
        ...props,
        // Add common props
        url: window.location.href,
        path: window.location.pathname,
        ...getDeviceInfo()
      },
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.eventsQueue.push(event);
    console.log(`[Analytics] ${eventName}`, event);

    // Flush immediately for critical events
    if (['session_start', 'error_captured'].includes(eventName)) {
      this.flush();
    }
  }

  /**
   * Flush queued events to analytics service
   */
  private async flush(): Promise<void> {
    if (this.eventsQueue.length === 0) return;

    const eventsToSend = [...this.eventsQueue];
    this.eventsQueue = [];

    try {
      // For now, send to console (replace with actual analytics service)
      // In production, replace with Plausible, Simple Analytics, or custom endpoint
      eventsToSend.forEach(event => {
        console.log('[Analytics Flush]', event);
      });

      // Example: Send to Plausible
      /*
      if (this.config.domain) {
        await fetch(`https://${this.config.domain}/api/event`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: event.name,
            domain: this.config.domain,
            url: event.props.url,
            props: event.props,
            userId: event.userId,
          }),
        });
      }
      */

      // Example: Send to custom endpoint
      /*
      if (this.config.apiHost) {
        await fetch(`${this.config.apiHost}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventsToSend),
        });
      }
      */

    } catch (error) {
      console.error('[Analytics] Failed to send events:', error);
      // Re-queue events on failure
      this.eventsQueue.unshift(...eventsToSend);
    }
  }

  /**
   * Manually flush events
   */
  flushSync(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush();
  }

  /**
   * Get current user and session info
   */
  getContext() {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      device: getDeviceInfo()
    };
  }
}

// Global analytics instance
let analytics: AnalyticsTracker | null = null;

/**
 * Initialize analytics system
 */
export function initAnalytics(config: AnalyticsConfig = { enabled: true }): void {
  analytics = new AnalyticsTracker(config);

  // Track session start
  analytics.track('session_start', {
    session_type: 'game_session'
  });

  // Track page view
  analytics.track('pageview', {
    page_title: document.title
  });
}

/**
 * Get analytics tracker instance
 */
export function getAnalytics(): AnalyticsTracker | null {
  return analytics;
}

/**
 * Track game events
 */
export const trackGameEvent = {
  sessionStart: () => analytics?.track('session_start'),
  gameStart: (level: number, laneCount: number) => analytics?.track('game_start', { level, lane_count: laneCount }),
  levelComplete: (level: number, score: number, duration: number) => analytics?.track('level_complete', { level, score, duration }),
  death: (reason: string, level: number, score: number) => analytics?.track('death', { reason, level, score }),
  shopOpen: (availableItems: string[]) => analytics?.track('shop_open', { available_items: availableItems }),
  itemPurchase: (itemType: string, cost: number, remainingScore: number) => analytics?.track('item_purchase', { item_type: itemType, cost, remaining_score: remainingScore }),
  collectItem: (type: 'gem' | 'letter', value: number, lane: number) => analytics?.track('collect_item', { type, value, lane }),
  performanceSnapshot: (fps: number, memoryUsage: number) => analytics?.track('performance_snapshot', { fps, memory_usage: memoryUsage }),
  errorCaptured: (errorType: string, message: string) => analytics?.track('error_captured', { error_type: errorType, message: message.substring(0, 500) })
};

/**
 * Cleanup analytics on app unload
 */
export function cleanupAnalytics(): void {
  if (analytics) {
    analytics.flushSync();
  }
}
