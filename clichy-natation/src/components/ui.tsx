import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { verificationLabel, type Verification } from "@/data/sources";

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
export { cx };

type Variant = "signal" | "ink" | "outline-light" | "outline-dark";

const variants: Record<Variant, string> = {
  signal: "bg-signal text-ink hover:bg-white",
  ink: "bg-ink text-white hover:bg-graphite",
  "outline-light": "border border-white/35 text-white hover:border-white hover:bg-white hover:text-ink",
  "outline-dark": "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-white",
};

type ButtonProps = {
  href: string;
  variant?: Variant;
  children: ReactNode;
  icon?: "diag" | "right" | "none";
  className?: string;
  size?: "md" | "lg";
} & Omit<ComponentProps<"a">, "href">;

const isExternal = (href: string) => /^https?:\/\//.test(href);

export function Button({ href, variant = "signal", children, icon = "diag", className, size = "md", ...rest }: ButtonProps) {
  const Icon = icon === "right" ? ArrowRight : ArrowUpRight;
  const classes = cx(
    "group inline-flex items-center justify-center gap-2 rounded-xs font-display font-medium uppercase tracking-[0.08em] transition-colors duration-300",
    size === "lg" ? "h-14 px-7 text-sm" : "h-11 px-5 text-[0.8rem]",
    variants[variant],
    className,
  );
  const content = (
    <>
      <span>{children}</span>
      {icon !== "none" && (
        <Icon
          aria-hidden
          className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={2}
        />
      )}
    </>
  );
  if (isExternal(href)) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {content}
        <span className="sr-only"> (nouvel onglet)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}

/** Lien éditorial souligné, avec flèche. */
export function TextLink({ href, children, className, tone = "dark" }: { href: string; children: ReactNode; className?: string; tone?: "dark" | "light" }) {
  const external = isExternal(href);
  const classes = cx(
    "group inline-flex items-center gap-3 font-display text-sm font-medium uppercase tracking-[0.12em]",
    tone === "light" ? "text-white" : "text-ink",
    className,
  );
  const inner = (
    <>
      <span className="relative pb-1">
        {children}
        <span className="absolute inset-x-0 bottom-0 h-px origin-left bg-current transition-transform duration-500 ease-out group-hover:scale-x-0" />
        <span className="absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-signal transition-transform delay-150 duration-500 ease-out group-hover:origin-left group-hover:scale-x-100" />
      </span>
      {external ? (
        <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      ) : (
        <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      )}
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
  return (
    <p className={cx("eyebrow flex items-center gap-3", tone === "light" ? "text-white/70" : "text-muted-strong", className)}>
      <span aria-hidden className="h-px w-8 bg-signal" />
      {children}
    </p>
  );
}

export function StatusBadge({ status, className }: { status: Verification; className?: string }) {
  if (status === "officiel") return null;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-xs border px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider",
        status === "a-valider" ? "border-ink/20 text-ink/70" : "border-ink/15 text-ink/60",
        className,
      )}
      title={verificationLabel[status]}
    >
      <span aria-hidden className={cx("size-1.5 rounded-full", status === "a-valider" ? "bg-signal ring-1 ring-ink/40" : "bg-muted")} />
      {verificationLabel[status]}
    </span>
  );
}

export function formatPrice(amount: number | null) {
  if (amount === null) return "Nous consulter";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}
