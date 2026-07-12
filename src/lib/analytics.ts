declare global {
  interface Window {
    tianji?: {
      track: (name: string, data?: Record<string, unknown>) => void;
      identify: (data: Record<string, unknown>) => void;
    };
  }
}

export function trackEvent(name: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.tianji) return;
  window.tianji.track(name, data);
}
