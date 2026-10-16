import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { verificationLabel, type Verification } from "@/data/sources";

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
export { cx };

type Variant = "signal" | "ink" | "outline-light" | "outline-dark";

const variants: Record<Variant, string> = {
  signal: "bg-signal text-ink hover:brightness-95",
  ink: "bg-ink text-white hover:bg-black",
  "outline-light": "border border-white/80 text-white hover:bg-white hover:text-ink",
  "outline-dark": "border border-ink text-ink hover:bg-ink hover:text-white",
};

type ButtonProps = {
  href: string;
  variant?: Variant;
  children: ReactNode;
  /** Conservé pour compatibilité : les pilules n'affichent pas de flèche */
  icon?: "diag" | "right" | "none";
  className?: string;
  size?: "md" | "lg";
} & Omit<ComponentProps<"a">, "href">;

const isExternal = (href: string) => /^https?:\/\//.test(href);

/** Bouton pilule. */
export function Button({ href, variant = "signal", children, icon: _icon, className, size = "md", ...rest }: ButtonProps) {
  const classes = cx(
    "inline-flex items-center justify-center rounded-full font-normal tracking-[-0.01em] transition-[background-color,color,filter] duration-200",
    size === "lg" ? "min-h-12 px-6 text-[17px]" : "min-h-10 px-5 text-[15px]",
    variants[variant],
    className,
  );
  if (isExternal(href)) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        <span className="sr-only"> (nouvel onglet)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

/** Lien de tuile : « En savoir plus › ». */
export function TextLink({ href, children, className, tone = "dark" }: { href: string; children: ReactNode; className?: string; tone?: "dark" | "light" }) {
  const external = isExternal(href);
  const classes = cx(
    "group inline-flex items-center gap-0.5 text-[17px] hover:underline",
    tone === "light" ? "text-signal" : "text-ink",
    className,
  );
  const inner = (
    <>
      {children}
      <ChevronRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.2} />
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {inner}
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  ) : (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}

export function Eyebrow({ children, className, tone = "dark" }: { children: ReactNode; className?: string; tone?: "dark" | "light" }) {
  return <p className={cx("eyebrow", tone === "light" ? "text-signal" : "text-muted-strong", className)}>{children}</p>;
}

export function StatusBadge({ status, className }: { status: Verification; className?: string }) {
  if (status === "officiel") return null;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full bg-paper px-2 py-0.5 text-[12px] font-medium text-muted-strong",
        className,
      )}
      title={verificationLabel[status]}
    >
      <span aria-hidden className={cx("size-1.5 rounded-full", status === "a-valider" ? "bg-signal ring-1 ring-ink/30" : "bg-muted")} />
      {verificationLabel[status]}
    </span>
  );
}

export function formatPrice(amount: number | null) {
  if (amount === null) return "Nous consulter";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}
