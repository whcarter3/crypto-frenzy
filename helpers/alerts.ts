/**
 * Alert messages displayed through the notification system. Slimmed in
 * the Phase 2 copy review (owner-approved): the buy/sell/start alerts
 * were orphaned once the trade modal's inline disabled reasons shipped
 * — only the last-day warning still fires.
 */
export const AlertMessages = {
  // "Last day!" prefix is asserted by features.cy.ts and
  // accessibility.cy.ts — keep it if rewording the tail.
  LAST_DAY: 'Last day! Sell everything — held coins score nothing.',
} as const;

export type AlertMessage =
  (typeof AlertMessages)[keyof typeof AlertMessages];
