import { useRef, useEffect } from 'react';

export const useDragToScroll = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
      element.classList.add('cursor-grabbing');
    };

    const handleMouseLeave = () => {
      isDown = false;
      element.classList.remove('cursor-grabbing');
    };

    const handleMouseUp = () => {
      isDown = false;
      element.classList.remove('cursor-grabbing');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX) * 2; // Adjust scroll speed here
      element.scrollLeft = scrollLeft - walk;
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mousemove', handleMouseMove);

    // Touch events for mobile devices
    let startXTouch: number;
    let scrollLeftTouch: number;

    const handleTouchStart = (e: TouchEvent) => {
      isDown = true;
      const touch = e.touches[0];
      startXTouch = touch.pageX - element.offsetLeft;
      scrollLeftTouch = element.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDown) return;
      const touch = e.touches[0];
      const x = touch.pageX - element.offsetLeft;
      const walk = (x - startXTouch) * 2;
      element.scrollLeft = scrollLeftTouch - walk;
    };

    const handleTouchEnd = () => {
      isDown = false;
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return ref;
};
