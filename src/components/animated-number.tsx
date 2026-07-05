import React, { useEffect, useRef } from 'react';
import { useInView, useSpring, useTransform, motion } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  const springValue = useSpring(0, {
    stiffness: 70,
    damping: 15,
    mass: 1,
  });

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  const display = useTransform(springValue, (current) => Math.round(current).toLocaleString());

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
