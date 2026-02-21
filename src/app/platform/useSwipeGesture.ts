import { useRef, useCallback } from "react";
import { hapticSwipe } from "./haptics";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function useSwipeGesture({ onSwipeLeft, onSwipeRight }: SwipeHandlers) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      const dt = Date.now() - touchStart.current.time;

      const MIN_DISTANCE = 60;
      const MAX_TIME = 400;
      const MAX_VERTICAL = 80;

      if (Math.abs(dx) > MIN_DISTANCE && Math.abs(dy) < MAX_VERTICAL && dt < MAX_TIME) {
        if (dx > 0 && onSwipeRight) {
          hapticSwipe();
          onSwipeRight();
        } else if (dx < 0 && onSwipeLeft) {
          hapticSwipe();
          onSwipeLeft();
        }
      }

      touchStart.current = null;
    },
    [onSwipeLeft, onSwipeRight]
  );

  return { onTouchStart, onTouchEnd };
}
