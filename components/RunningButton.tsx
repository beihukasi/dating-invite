"use client";

import { useState, useRef, useCallback } from "react";

export default function RunningButton() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const attemptsRef = useRef(0);

  const moveButton = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const btnW = btn.offsetWidth || 120;
    const btnH = btn.offsetHeight || 48;

    const maxX = vw - btnW - 16;
    const maxY = vh - btnH - 16;

    const newX = Math.max(8, Math.min(maxX, Math.random() * maxX));
    const newY = Math.max(8, Math.min(maxY, Math.random() * maxY));

    setPosition({ x: newX, y: newY });
    attemptsRef.current += 1;
  }, []);

  const handleMouseEnter = () => {
    if (attemptsRef.current < 30) {
      moveButton();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (attemptsRef.current < 30) {
      moveButton();
    }
  };

  return (
    <button
      ref={btnRef}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      onClick={(e) => e.preventDefault()}
      style={
        position
          ? {
              position: "fixed",
              left: position.x,
              top: position.y,
              zIndex: 50,
              transition: "left 0.15s ease-out, top 0.15s ease-out",
            }
          : {
              zIndex: 50,
            }
      }
      className="px-8 py-4 bg-gray-300 text-gray-500 font-bold text-xl rounded-full shadow-lg cursor-default select-none"
    >
      💔 不愿意
    </button>
  );
}
