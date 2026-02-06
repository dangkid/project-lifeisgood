import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      className={`p-2 rounded-lg transition-colors ${
        isOnline
          ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900'
          : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900 animate-pulse'
      }`}
      title={isOnline ? 'Conectado' : 'Sin conexión'}
    >
      {isOnline ? (
        <Wifi size={20} className="text-green-600" />
      ) : (
        <WifiOff size={20} className="text-red-600" />
      )}
    </div>
  );
}
