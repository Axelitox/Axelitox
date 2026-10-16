"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Menu, X } from "lucide-react";
import { mainNav, site } from "@/lib/site";
import { Logo } from "./Logo";
import { cx } from "./ui";

const ease = [0.16, 1, 0.3, 1] as const;
const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

const flyoutSide = [
  {
    title: "Planning & tarifs",
    links: [
      { label: "Trouver un créneau", href: "/planning-tarifs#planning" },
      { label: "Tarifs", href: "/planning-tarifs#tarifs" },
      { label: "Infos pratiques", href: "/planning-tarifs#pratique" },
    ],
  },
  {
    title: "Le club",
    links: [
      { label: "La piscine", href: "/piscine" },
      { label: "Compétition", href: "/competition" },
      { label: "Inscriptions", href: "/inscriptions" },
    ],
  },
];

/** Barre de navigation globale : fine, translucide, avec panneau déroulant plein largeur. */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [flyout, setFlyout] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOpen(false);
    setFlyout(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setFlyout(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const openFlyout = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setFlyout(true);
  };
  const closeFlyout = () => {
    closeTimer.current = setTimeout(() => setFlyout(false), 120);
  };
  const activities = mainNav.find((i) => i.children)!;

  return (
    <>
      <a
        href="#contenu"
        className="sr-only z-[60] rounded-full bg-ink px-4 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-2"
      >
        Aller au contenu
      </a>

      <header className={cx("relative z-50 text-ink", open ? "bg-white" : "bg-[rgba(250,250,252,0.85)] backdrop-blur-xl backdrop-saturate-[1.8]")}>
        <div className="container-x flex h-11 items-center justify-between gap-4 md:h-11">
          <Logo tone="dark" />

          <nav aria-label="Navigation principale" className="hidden flex-1 md:block">
            <ul className="mx-auto flex max-w-[760px] items-center justify-between px-6">
              {mainNav.slice(1).map((item) => {
                const active = isActive(pathname, item.href);
                const hasFlyout = Boolean(item.children);
                return (
                  <li key={item.href} onMouseEnter={hasFlyout ? openFlyout : undefined} onMouseLeave={hasFlyout ? closeFlyout : undefined}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      aria-expanded={hasFlyout ? flyout : undefined}
                      onFocus={hasFlyout ? openFlyout : undefined}
                      className={cx(
                        "block px-2 py-3 text-[12px] tracking-[-0.01em] transition-colors",
                        active ? "text-ink" : "text-ink/80 hover:text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={site.links.memberArea}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-[12px] text-ink/80 hover:text-ink lg:inline"
            >
              Espace adhérent<span className="sr-only"> (nouvel onglet)</span>
            </a>
            <Link
              href="/inscriptions"
              className="hidden rounded-full bg-signal px-3 py-1 text-[12px] font-medium text-ink transition hover:brightness-95 sm:inline-flex"
            >
              S&apos;inscrire
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              className="-mr-2 grid size-10 place-items-center md:hidden"
            >
              {open ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Panneau déroulant plein largeur (desktop) */}
        <AnimatePresence>
          {flyout && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease }}
              onMouseEnter={openFlyout}
              onMouseLeave={closeFlyout}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setFlyout(false);
              }}
              className="absolute inset-x-0 top-full hidden overflow-hidden bg-[rgba(250,250,252,0.97)] backdrop-blur-xl md:block"
            >
              <div className="container-x grid grid-cols-[1.4fr_1fr_1fr] gap-10 pb-16 pt-10">
                <div>
                  <p className="text-[12px] text-muted-strong">Explorer les activités</p>
                  <ul className="mt-4 space-y-2">
                    {activities.children!.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} className="text-2xl font-semibold tracking-[-0.01em] text-ink hover:underline">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                {flyoutSide.map((col) => (
                  <div key={col.title}>
                    <p className="text-[12px] text-muted-strong">{col.title}</p>
                    <ul className="mt-4 space-y-3">
                      {col.links.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} className="text-[12px] font-semibold text-ink/90 hover:underline">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Voile flouté sous le panneau */}
      <AnimatePresence>
        {flyout && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 hidden bg-black/20 backdrop-blur-[10px] md:block"
          />
        )}
      </AnimatePresence>

      {/* Menu mobile plein écran */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 top-11 z-50 overflow-y-auto bg-white md:hidden"
          >
            <nav aria-label="Navigation mobile" className="px-12 pb-12 pt-6">
              <ul>
                {mainNav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.03 * i, ease }}
                  >
                    <Link
                      href={item.href}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className="flex items-center justify-between py-1.5 text-[28px] font-semibold tracking-[-0.01em] text-ink"
                    >
                      {item.label}
                      {item.children && <ChevronRight aria-hidden className="size-5 text-muted" />}
                    </Link>
                    {item.children && (
                      <ul className="mb-3 mt-1 space-y-1.5 pl-0.5">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="text-[17px] text-muted-strong">
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.li>
                ))}
              </ul>
              <div className="mt-10 space-y-4">
                <p className="text-[12px] text-muted-strong">Raccourcis</p>
                <Link href="/inscriptions" className="block text-[17px] font-semibold">
                  S&apos;inscrire
                </Link>
                <a href={site.links.memberArea} target="_blank" rel="noopener noreferrer" className="block text-[17px] font-semibold">
                  Espace adhérent
                </a>
                <a href={`mailto:${site.email}`} className="block text-[17px] font-semibold">
                  Nous écrire
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
