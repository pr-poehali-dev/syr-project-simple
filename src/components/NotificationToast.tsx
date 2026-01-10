import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

type Notification = {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
};

type NotificationToastProps = {
  notifications: Notification[];
  onDismiss: (id: string) => void;
};

export default function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notif) => (
        <Card
          key={notif.id}
          className={`p-4 shadow-lg animate-fade-in flex items-start gap-3 ${
            notif.type === 'success' ? 'bg-green-50 border-green-200' :
            notif.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            'bg-blue-50 border-blue-200'
          }`}
        >
          <Icon
            name={notif.type === 'success' ? 'CheckCircle' : 'Bell'}
            size={20}
            className={
              notif.type === 'success' ? 'text-green-600' :
              notif.type === 'warning' ? 'text-yellow-600' :
              'text-blue-600'
            }
          />
          <p className="flex-1 text-sm">{notif.message}</p>
          <button
            onClick={() => onDismiss(notif.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon name="X" size={16} />
          </button>
        </Card>
      ))}
    </div>
  );
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    dismissNotification
  };
}
