import { useState, useEffect } from 'react';

export function useScannerMode(buttons, enabled = false) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scanSpeed] = useState(2000); // ms - removido setScanSpeed por ahora

  useEffect(() => {
    if (!enabled || buttons.length === 0) {
      setCurrentIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % buttons.length);
    }, scanSpeed);

    return () => clearInterval(interval);
  }, [enabled, buttons.length, scanSpeed]);

  const handleSelection = () => {
    if (buttons.length > 0 && enabled) {
      return buttons[currentIndex];
    }
    return null;
  };

  return {
    currentIndex,
    scanSpeed,
    handleSelection
  };
}
