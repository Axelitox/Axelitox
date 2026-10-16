"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { site } from "@/lib/site";
import { activities } from "@/data/activities";

type State = { status: "idle" | "sending" | "sent" | "error"; message?: string };

export function ContactForm() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Envoi impossible.");
      form.reset();
      setState({ status: "sent" });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Envoi impossible." });
    }
  }

  if (state.status === "sent") {
    return (
      <div role="status" className="border border-ink/10 bg-white p-8">
        <Check aria-hidden className="size-8" />
        <p className="mt-4 font-display text-2xl font-semibold">Message envoyé.</p>
        <p className="mt-2 text-muted-strong">Merci, le club vous répondra par email.</p>
      </div>
    );
  }

  const field =
    "mt-2 block w-full rounded-xs border border-ink/15 bg-white px-4 py-3 text-base transition-colors focus:border-ink focus:outline-none";
  const label = "eyebrow text-[12px] text-muted-strong";

  return (
    <form onSubmit={onSubmit} className="grid gap-6" noValidate={false}>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Nom et prénom *</span>
          <input name="name" required autoComplete="name" maxLength={120} className={field} />
        </label>
        <label className="block">
          <span className={label}>Email *</span>
          <input name="email" type="email" required autoComplete="email" maxLength={200} className={field} />
        </label>
      </div>
      <label className="block">
        <span className={label}>Activité concernée</span>
        <select name="topic" className={field} defaultValue="">
          <option value="">Question générale</option>
          {activities.map((a) => (
            <option key={a.slug} value={a.name}>
              {a.name}
            </option>
          ))}
          <option value="Inscriptions">Inscriptions</option>
        </select>
      </label>
      <label className="block">
        <span className={label}>Message *</span>
        <textarea name="message" required rows={6} minLength={10} maxLength={5000} className={field} />
      </label>
      {/* Pot de miel anti-spam */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Ne pas remplir
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm text-muted-strong">
        <input type="checkbox" name="consent" required className="mt-1 size-4 accent-ink" />
        <span>
          J&apos;accepte que mes données soient utilisées uniquement pour répondre à ma demande.{" "}
          <a href="/confidentialite" className="underline">
            Politique de confidentialité
          </a>
          .
        </span>
      </label>
      {state.status === "error" && (
        <p role="alert" className="border-l-2 border-ink bg-white p-4 text-sm">
          {state.message} Vous pouvez aussi écrire directement à{" "}
          <a href={`mailto:${site.email}`} className="underline">
            {site.email}
          </a>
          .
        </p>
      )}
      <button
        type="submit"
        disabled={state.status === "sending"}
        className="group inline-flex h-14 items-center justify-center gap-2 rounded-xs bg-ink px-7 font-display text-sm font-medium text-white transition-colors hover:bg-graphite disabled:opacity-60 sm:justify-self-start"
      >
        {state.status === "sending" ? "Envoi…" : "Envoyer"}
        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}
