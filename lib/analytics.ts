import { track } from '@vercel/analytics';

/**
 * Custom gameplay events, riding the same gate as the <Analytics />
 * component in App.tsx: off Vercel the insights script doesn't exist,
 * so track() would queue events into the void and warn in dev — the
 * whole thing no-ops instead. Properties are anonymous run facts
 * (mode, score), never anything player-identifying.
 */
export const trackEvent = (
  name: 'run_started' | 'run_finished',
  props: Record<string, string | number | boolean>,
): void => {
  if (!__VERCEL__) return;
  track(name, props);
};
