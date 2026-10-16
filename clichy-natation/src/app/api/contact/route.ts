import { NextResponse } from "next/server";

/**
 * Formulaire de contact.
 * Envoi via l'API Resend si RESEND_API_KEY est défini ; sinon renvoie 503 et
 * l'interface propose l'email du club. Aucune donnée n'est stockée côté site.
 */
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Pot de miel : on répond « OK » aux robots sans rien envoyer
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const topic = clean(body.topic, 120) || "Question générale";
  const message = clean(body.message, 5000);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10 || !body.consent) {
    return NextResponse.json({ error: "Merci de compléter correctement tous les champs obligatoires." }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "L'envoi en ligne est momentanément indisponible." }, { status: 503 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "site@clichy-natation.com",
      to: process.env.CONTACT_TO_EMAIL ?? "contact@clichy-natation.com",
      reply_to: email,
      subject: `[Site] ${topic} — ${name}`,
      html: `<p><strong>${escape(name)}</strong> &lt;${escape(email)}&gt;</p><p>Sujet : ${escape(topic)}</p><p>${escape(message).replace(/\n/g, "<br>")}</p>`,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "L'envoi a échoué." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
