import Link from "next/link";
import site from "@/data/site.json";
import { Logo } from "@/components/Logo";
import { HoursTable } from "@/components/HoursTable";
import { InstagramIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import type { Dict, Locale } from "@/lib/i18n";
import { pagePath } from "@/lib/pages";

export function Footer({ lang, d }: { lang: Locale; d: Dict }) {
  const pages = [
    { href: pagePath("carte", lang), label: d.pages.carte.title },
    { href: pagePath("commander", lang), label: d.pages.commander.title },
    { href: pagePath("banhMi", lang), label: d.pages.banhMi.eyebrow },
    { href: pagePath("boBun", lang), label: d.pages.boBun.eyebrow },
  ];
  return (
    <footer className="bg-red pb-24 text-cream md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 md:px-10 md:py-20 lg:grid-cols-[1.2fr_1fr_1fr_1.2fr]">
        <div>
          <Logo tone="cream" size="lg" />
          <p className="mt-6 max-w-xs leading-relaxed text-cream/85">{d.footer.tagline}</p>
        </div>
        <div className="leading-relaxed">
          <p className="eyebrow mb-3 !text-rice">{d.footer.contact}</p>
          <address className="not-italic">
            {site.address.street}
            <br />
            {site.address.postalCode} {site.address.city}
          </address>
          <ul className="mt-4 space-y-1">
            <li>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex min-h-10 items-center gap-2 font-semibold hover:underline">
                <PhoneIcon className="h-4 w-4" />
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 hover:underline">
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
            </li>
            <li>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 hover:underline">
                <InstagramIcon className="h-4 w-4" />
                {site.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3 !text-rice">{d.footer.pages}</p>
          <ul className="space-y-1">
            {pages.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="inline-flex min-h-10 items-center hover:underline">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="[&_.text-muted]:text-cream/65 [&_tr]:border-cream/20">
          <p className="eyebrow mb-3 !text-rice">{d.footer.hours}</p>
          <HoursTable lang={lang} d={d} compact />
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-2 border-t border-cream/20 px-6 py-6 text-sm text-cream/80 md:flex-row md:px-10">
        <p>
          © {new Date().getFullYear()} {site.fullName}
        </p>
        <Link href={pagePath("legal", lang)} className="inline-flex min-h-10 items-center hover:underline">
          {d.footer.legal}
        </Link>
      </div>
    </footer>
  );
}
