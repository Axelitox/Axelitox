"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

/** Révélation douce au scroll (les déplacements sont neutralisés si prefers-reduced-motion, via MotionConfig). */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "span";
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </Comp>
  );
}

/** Titre révélé ligne par ligne (masque). Le déclencheur est le conteneur, jamais les lignes masquées. */
export function RevealLines({ lines, className, delay = 0 }: { lines: ReactNode[]; className?: string; delay?: number }) {
  return (
    <motion.span
      className={className ?? "block"}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -5% 0px" }}
      transition={{ staggerChildren: 0.08, delayChildren: delay }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className="block"
            variants={{ hidden: { y: "105%" }, show: { y: "0%" } }}
            transition={{ duration: 0.9, ease }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
