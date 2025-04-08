import { useEffect } from 'react';

export type NotificationType =
  | 'info'
  | 'success'
  | 'error'
  | 'warning';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
  duration?: number;
}

const getNotificationStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/10 border-green-500/30 text-green-400';
    case 'error':
      return 'bg-red-500/10 border-red-500/30 text-red-400';
    case 'warning':
      return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    default:
      return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
  }
};

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    default:
      return 'ℹ';
  }
};

const Notification = ({
  message,
  type,
  onClose,
  duration = 3000,
}: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border ${getNotificationStyles(
        type
      )} animate-slide-up`}
      role="alert"
    >
      <span className="text-lg">{getIcon(type)}</span>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
};

export default Notification;
