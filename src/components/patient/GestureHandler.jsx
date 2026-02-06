import { useEffect, useRef } from 'react';

export default function GestureHandler({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onDoubleTap,
  onLongPress,
  enabled = true,
  threshold = 50, // minimum distance for swipe
  children
}) {
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const longPressTimerRef = useRef(null);
  const doubleTapTimerRef = useRef(null);
  const lastTapRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const element = document.querySelector('[data-gesture-container]');
    if (!element) return;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      // Detectar long press
      longPressTimerRef.current = setTimeout(() => {
        onLongPress?.({ x: touch.clientX, y: touch.clientY });
      }, 500);
    };

    const handleTouchMove = (e) => {
      // Cancelar long press si el usuario se mueve
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    const handleTouchEnd = (e) => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Detectar double tap
      const now = Date.now();
      if (now - lastTapRef.current <= 300) {
        clearTimeout(doubleTapTimerRef.current);
        onDoubleTap?.({ x: touch.clientX, y: touch.clientY });
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
        doubleTapTimerRef.current = setTimeout(() => {
          lastTapRef.current = 0;
        }, 300);
      }

      // Solo procesar swipes rápidos
      if (deltaTime > 500) return;

      // Detectar dirección
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > threshold && absX > absY) {
        if (deltaX > 0) {
          onSwipeRight?.({ distance: deltaX, x: touch.clientX, y: touch.clientY });
        } else {
          onSwipeLeft?.({ distance: Math.abs(deltaX), x: touch.clientX, y: touch.clientY });
        }
      } else if (absY > threshold && absY > absX) {
        if (deltaY > 0) {
          onSwipeDown?.({ distance: deltaY, x: touch.clientX, y: touch.clientY });
        } else {
          onSwipeUp?.({ distance: Math.abs(deltaY), x: touch.clientX, y: touch.clientY });
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (doubleTapTimerRef.current) clearTimeout(doubleTapTimerRef.current);
    };
  }, [enabled, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap, onLongPress, threshold]);

  return (
    <div data-gesture-container>
      {children}
    </div>
  );
}
