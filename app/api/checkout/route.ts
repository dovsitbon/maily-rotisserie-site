import { NextResponse } from "next/server";
import site from "@/data/site.json";
import fr from "@/locales/fr.json";
import { isItem, ITEMS, type ItemId } from "@/lib/carte";

// Paiement en ligne (Stripe Checkout), PRÉVU MAIS DÉSACTIVÉ.
// Pour l'activer : data/site.json → payment.enabled = true, et la variable STRIPE_SECRET_KEY sur Vercel.
// Seuls les articles à prix fixe sont encaissés ; la commande part quand même sur WhatsApp pour Maily.

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!site.payment.enabled || !key) return NextResponse.json({ error: "payment-disabled" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const lines = Array.isArray(body?.lines) ? body.lines : [];
  const params = new URLSearchParams({ mode: "payment", locale: body?.lang === "en" ? "en" : "fr" });
  const origin = new URL(req.url).origin;
  params.set("success_url", `${origin}/${body?.lang === "en" ? "en/order" : "fr/commander"}?paye=1`);
  params.set("cancel_url", `${origin}/${body?.lang === "en" ? "en/order" : "fr/commander"}`);
  let i = 0;
  for (const l of lines) {
    const id: unknown = l?.item;
    if (!isItem(id) || !Number.isInteger(l.qty) || l.qty < 1 || l.qty > site.order.maxPerLine) continue;
    const it = ITEMS[id as ItemId];
    if (it.price === null || it.from) continue;
    params.set(`line_items[${i}][quantity]`, String(l.qty));
    params.set(`line_items[${i}][price_data][currency]`, "eur");
    params.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(it.price * 100)));
    params.set(`line_items[${i}][price_data][product_data][name]`, fr.products[id as ItemId].name);
    i++;
  }
  if (!i) return NextResponse.json({ error: "empty" }, { status: 400 });

  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/x-www-form-urlencoded" }, body: params });
  const j = await r.json();
  return r.ok ? NextResponse.json({ url: j.url }) : NextResponse.json({ error: "stripe" }, { status: 502 });
}
