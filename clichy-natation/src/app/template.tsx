"use client";

import { motion } from "motion/react";

/** Transition de page : fondu très court, pour ne jamais ralentir la navigation. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
