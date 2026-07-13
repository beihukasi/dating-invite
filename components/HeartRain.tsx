"use client";

import { useEffect, useRef } from "react";

const EMOJIS = ["💕", "💖", "💗", "💝", "🌸", "✨", "🩷", "💐"];

export default function HeartRain() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      const el = document.createElement("span");
      el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      el.className = "heart-float";
      el.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}vw;
        bottom: -40px;
        font-size: ${Math.random() * 20 + 14}px;
        animation-duration: ${Math.random() * 6 + 8}s;
        animation-delay: 0s;
        pointer-events: none;
        z-index: 0;
        opacity: 0.7;
      `;
      container.appendChild(el);

      setTimeout(() => {
        el.remove();
      }, 15000);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
}
