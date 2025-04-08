import { NotificationType } from '../components/Notification';

/**
 * Alert messages that can be displayed to the user through the notification system.
 */
export const AlertMessages = {
  NEED_START: 'Start the game first!',
  NEED_WALLET: 'Increase wallet capacity to buy more assets!',
  INSUFFICIENT_FUNDS: 'Not enough cash to buy this asset!',
  INSUFFICIENT_ASSETS: 'Not enough assets to sell!',
  LAST_DAY:
    'Last day! Better sell all your assets to secure your score!',
} as const;

export type AlertMessage =
  (typeof AlertMessages)[keyof typeof AlertMessages];

/**
 * Gets the appropriate notification type for a given alert message.
 * Used with the notification system to determine styling and icon.
 */
export const getAlertType = (
  message: AlertMessage
): NotificationType => {
  switch (message) {
    case AlertMessages.NEED_START:
      return 'info';
    case AlertMessages.NEED_WALLET:
    case AlertMessages.LAST_DAY:
      return 'warning';
    case AlertMessages.INSUFFICIENT_FUNDS:
    case AlertMessages.INSUFFICIENT_ASSETS:
      return 'error';
    default:
      return 'info';
  }
};
