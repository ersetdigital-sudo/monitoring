"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedBarProps {
  value: number; // 0 - 100
  duration?: number;
  className?: string;
  background?: string;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function AnimatedBar({
  value,
  duration = 1000,
  className = "",
  background = "var(--brand)",
}: AnimatedBarProps) {
  const [width, setWidth] = useState(0);
  const targetRef = useRef(0);

  useEffect(() => {
    const from = targetRef.current;
    if (from === value) return;

    let raf: number;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setWidth(from + (value - from) * easeOutCubic(t));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        targetRef.current = value;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <div
      className={`h-full rounded-full ${className}`}
      style={{ width: `${width}%`, background }}
    />
  );
}
