import { useState, useEffect, useCallback } from 'react';

export default function useScanning(items, settings, onSelect) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isScanning, setIsScanning] = useState(false);

  // Iniciar barrido
  useEffect(() => {
    if (!settings.scanningEnabled || items.length === 0) {
      setCurrentIndex(-1);
      setIsScanning(false);
      return;
    }

    setIsScanning(true);
    setCurrentIndex(0);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= items.length - 1) return 0;
        return prev + 1;
      });
    }, settings.scanSpeed || 1500);

    return () => clearInterval(interval);
  }, [settings.scanningEnabled, settings.scanSpeed, items.length]);

  // Listener para cualquier tecla
  useEffect(() => {
    if (!isScanning) return;

    const handleKeyPress = (e) => {
      // Cualquier tecla selecciona el item actual
      if (currentIndex >= 0 && currentIndex < items.length) {
        e.preventDefault();
        const selectedItem = items[currentIndex];
        
        // Feedback visual y sonoro
        if (settings.strongFeedback) {
          // Vibración
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
          // Sonido de confirmación
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAo=');
          audio.play().catch(() => {});
        }
        
        onSelect(selectedItem);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, items, isScanning, onSelect, settings.strongFeedback]);

  return { currentIndex, isScanning };
}
