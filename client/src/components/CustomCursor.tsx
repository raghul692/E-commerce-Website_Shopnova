import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show custom cursor on non-touch desktop screens
    if (window.matchMedia('(pointer: coarse)').matches) return;

    setIsVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.closest('button') ||
          target.closest('a') ||
          target.dataset.cursor === 'hover')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let animId: number;

    const followCursor = () => {
      setTrailingPos((prev) => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        return {
          x: prev.x + dx * 0.18,
          y: prev.y + dy * 0.18
        };
      });
      animId = requestAnimationFrame(followCursor);
    };

    animId = requestAnimationFrame(followCursor);
    return () => cancelAnimationFrame(animId);
  }, [position, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Pointer dot */}
      <div
        className="fixed pointer-events-none z-[9999] w-2.5 h-2.5 bg-brand-500 dark:bg-brand-cyan rounded-full transition-transform duration-100 ease-out shadow-[0_0_12px_rgba(0,242,254,0.8)]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isClicked ? 0.6 : isHovered ? 1.5 : 1})`
        }}
      />
      {/* Outer trailing aura ring */}
      <div
        className={`fixed pointer-events-none z-[9998] rounded-full border transition-all duration-300 ${
          isHovered
            ? 'w-12 h-12 border-brand-violet/60 bg-brand-violet/10 backdrop-blur-[2px] scale-110 shadow-[0_0_20px_rgba(112,0,255,0.4)]'
            : 'w-8 h-8 border-brand-500/40 dark:border-brand-cyan/40 scale-100'
        }`}
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
          transform: `translate(-50%, -50%) scale(${isClicked ? 0.8 : 1})`
        }}
      />
    </>
  );
};
