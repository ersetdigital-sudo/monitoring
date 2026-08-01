"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  style?: React.CSSProperties;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function AnimatedNumber({
  value,
  duration = 700,
  format = (n) => n.toLocaleString("id-ID"),
  className,
  style,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const targetRef = useRef(0);

  useEffect(() => {
    const from = targetRef.current;
    if (from === value) return;

    let raf: number;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setDisplay(from + (value - from) * easeOutCubic(t));
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
    <span className={className} style={style}>
      {format(display)}
    </span>
  );
}
