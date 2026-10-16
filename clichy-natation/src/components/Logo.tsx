import Image from "next/image";
import Link from "next/link";
import { media } from "@/data/media";
import { cx } from "./ui";

/**
 * Logo officiel du club. Tant que le fichier officiel n'est pas importé
 * (media.logo.src), on affiche le nom du club en texte — sans créer de faux logo.
 */
export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const color = tone === "light" ? "text-white" : "text-ink";
  return (
    <Link href="/" aria-label="CS Clichy 92 Natation — accueil" className={cx("inline-flex items-center", className)}>
      {media.logo.src ? (
        <Image src={media.logo.src} alt={media.logo.alt} width={140} height={48} className="h-10 w-auto" priority />
      ) : (
        <span className={cx("flex flex-col font-display leading-none", color)}>
          <span className="text-[0.95rem] font-bold tracking-[-0.02em]">
            CS CLICHY <span className="text-signal">92</span>
          </span>
          <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.32em] opacity-70">Natation</span>
        </span>
      )}
    </Link>
  );
}
