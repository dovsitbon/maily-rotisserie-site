import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import site from "@/data/site.json";
import { fill, getDict, isLocale, locales, type Dict, type Locale } from "@/lib/i18n";
import { formatDay } from "@/lib/format";
import { checked, type ItemId } from "@/lib/carte";
import { PAGE_IDS, pageOfSlug, pagePath, SLUGS, type PageId } from "@/lib/pages";
import { pageJsonLd } from "@/lib/jsonld";
import { MenuTabs, ProductCard } from "@/components/MenuTabs";
import { OrderForm } from "@/components/OrderForm";
import { OpenStatus } from "@/components/OpenStatus";
import { HoursTable } from "@/components/HoursTable";
import { Photo } from "@/components/Photo";
import { BagIcon, PhoneIcon } from "@/components/icons";

export function generateStaticParams() {
  return locales.flatMap((lang) => PAGE_IDS.map((id) => ({ lang, slug: SLUGS[id][lang] })));
}
export const dynamicParams = false;

function resolve(lang: string, slug: string): { lang: Locale; id: PageId } | null {
  if (!isLocale(lang)) return null;
  const id = pageOfSlug(slug, lang);
  return id ? { lang, id } : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const { lang: l, slug } = await params;
  const r = resolve(l, slug);
  if (!r) return {};
  const d = getDict(r.lang);
  const p = d.pages[r.id];
  const description = "metaDescription" in p ? p.metaDescription : d.meta.description;
  return {
    title: p.metaTitle,
    description,
    alternates: {
      canonical: pagePath(r.id, r.lang),
      languages: { ...Object.fromEntries(locales.map((x) => [x, pagePath(r.id, x)])), "x-default": pagePath(r.id, "fr") },
    },
    openGraph: { title: p.metaTitle, description, url: pagePath(r.id, r.lang), images: [{ url: "/og.jpg", width: 1200, height: 630 }] },
    robots: r.id === "legal" ? { index: false, follow: true } : undefined,
  };
}

function CallBand({ lang, d }: { lang: Locale; d: Dict }) {
  return (
    <div className="card mt-12 flex flex-col items-start gap-5 bg-rice-soft p-6 md:flex-row md:items-center md:justify-between md:p-8">
      <p className="display text-[1.75rem]">{d.order.callTitle}</p>
      <div className="flex flex-wrap gap-3">
        <Link href={pagePath("commander", lang)} className="btn">
          <BagIcon className="h-5 w-5" />
          {d.nav.orderCta}
        </Link>
        <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="btn-line">
          <PhoneIcon className="h-5 w-5" />
          {d.order.callCta}
        </a>
      </div>
    </div>
  );
}

function Carte({ lang, d }: { lang: Locale; d: Dict }) {
  const p = d.pages.carte;
  return (
    <div className="px-4 pt-10 pb-20 md:px-8 md:pt-16 md:pb-28">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">{p.eyebrow}</p>
            <h1 className="display mt-3 text-[3rem] md:text-[4.4rem]">{p.title}</h1>
            <p className="lead mt-4 max-w-xl">{p.lead}</p>
          </div>
          <div className="card bg-cream-deep p-5 md:p-6">
            <HoursTable lang={lang} d={d} compact />
            <div className="mt-3 font-medium">
              <OpenStatus />
            </div>
          </div>
        </header>
        <div className="mt-10">
          <MenuTabs />
        </div>
        <p className="mt-2 text-sm text-muted">{fill(d.carte.checked, { date: formatDay(checked, lang, { day: "numeric", month: "long", year: "numeric" }) })}</p>
        <CallBand lang={lang} d={d} />
      </div>
    </div>
  );
}

function Commander({ d }: { d: Dict }) {
  const p = d.pages.commander;
  return (
    <div className="px-4 pt-10 pb-20 md:px-8 md:pt-16 md:pb-28">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 max-w-2xl">
          <p className="eyebrow">{d.order.eyebrow}</p>
          <h1 className="display mt-3 text-[3rem] md:text-[4.4rem]">{p.title}</h1>
          <p className="lead mt-4">{p.lead}</p>
          <div className="mt-4 font-medium">
            <OpenStatus />
          </div>
        </header>
        <OrderForm />
      </div>
    </div>
  );
}

function Landing({ lang, d, id }: { lang: Locale; d: Dict; id: "banhMi" | "boBun" }) {
  const p = d.pages[id];
  return (
    <div className="px-4 pt-10 pb-20 md:px-8 md:pt-16 md:pb-28">
      <div className="mx-auto max-w-7xl">
        <header className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="eyebrow">{p.eyebrow}</p>
            <h1 className="display mt-3 text-[3rem] md:text-[4.2rem]">{p.title}</h1>
            <p className="lead mt-5 max-w-lg">{p.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={pagePath("commander", lang)} className="btn">
                <BagIcon className="h-5 w-5" />
                {d.nav.orderCta}
              </Link>
              <Link href={pagePath("carte", lang)} className="btn-line">
                {d.hero.ctaMenu}
              </Link>
            </div>
          </div>
          <Photo paths={[p.photo]} alt={d.alt[id === "banhMi" ? "banh-mi" : "bo-bun"]} illus={id === "banhMi" ? "banhmi" : "bowl"} sizes="(min-width: 768px) 46vw, 100vw" priority className="card aspect-[4/3]" />
        </header>
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {p.sections.map((s) => (
            <section key={s.title}>
              <h2 className="display text-[1.75rem]">{s.title}</h2>
              <p className="lead mt-3">{s.text}</p>
            </section>
          ))}
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(p.items as ItemId[]).map((it) => (
            <ProductCard key={it} id={it} />
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">{d.carte.halalNote}</p>
        <CallBand lang={lang} d={d} />
      </div>
    </div>
  );
}

function Legal({ d }: { d: Dict }) {
  const p = d.pages.legal;
  const pending = <em className="text-muted">{p.toConfirm}</em>;
  const blocks: [string, React.ReactNode][] = [
    [p.editor, `${site.legal.company}, ${site.address.street}, ${site.address.postalCode} ${site.address.city} · ${site.phone}`],
    [p.siret, site.legal.siret || pending],
    [p.director, site.legal.director || pending],
    [p.host, site.legal.host],
    [p.data, p.dataText],
    [p.photos, p.photosText],
  ];
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="display text-[2.8rem] md:text-[3.6rem]">{p.title}</h1>
      {blocks.map(([title, body]) => (
        <section key={title} className="mt-9">
          <h2 className="eyebrow">{title}</h2>
          <p className="mt-2 leading-relaxed">{body}</p>
        </section>
      ))}
    </div>
  );
}

export default async function Page({ params }: PageProps<"/[lang]/[slug]">) {
  const { lang: l, slug } = await params;
  const r = resolve(l, slug);
  if (!r) notFound();
  const d = getDict(r.lang);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd(r.lang, r.id)) }} />
      {r.id === "carte" && <Carte lang={r.lang} d={d} />}
      {r.id === "commander" && <Commander d={d} />}
      {(r.id === "banhMi" || r.id === "boBun") && <Landing lang={r.lang} d={d} id={r.id} />}
      {r.id === "legal" && <Legal d={d} />}
    </>
  );
}
