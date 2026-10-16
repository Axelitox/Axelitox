"use client";

import { MotionConfig } from "motion/react";

/** Respecte prefers-reduced-motion pour toutes les animations Motion. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
