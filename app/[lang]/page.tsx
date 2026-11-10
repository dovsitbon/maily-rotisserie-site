import Image from "next/image";
import Link from "next/link";
import site from "@/data/site.json";
import avis from "@/data/avis.json";
import { getDict, altOf, fill, isLocale, type Dict, type Locale } from "@/lib/i18n";
import { formatDay } from "@/lib/format";
import { firstImg } from "@/lib/media";
import { pagePath } from "@/lib/pages";
import { homeJsonLd } from "@/lib/jsonld";
import { checked } from "@/lib/carte";
import { waLink } from "@/lib/whatsapp";
import { Reveal } from "@/components/Reveal";
import { OpenStatus } from "@/components/OpenStatus";
import { Tiles } from "@/components/Tiles";
import { MenuTabs } from "@/components/MenuTabs";
import { HoursTable } from "@/components/HoursTable";
import { Photo } from "@/components/Photo";
import { Illus } from "@/components/Illus";
import { BagIcon, PhoneIcon, PinIcon, PlusIcon, StarIcon, WhatsAppIcon } from "@/components/icons";

export const revalidate = 3600;

function Rating({ lang, d, className = "" }: { lang: Locale; d: Dict; className?: string }) {
  const value = new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB", { minimumFractionDigits: 1 }).format(site.rating.value);
  return (
    <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-6 items-center gap-2 font-semibold hover:underline ${className}`} title={fill(d.hero.ratingNote, { date: formatDay(site.rating.checked, lang, { day: "numeric", month: "long", year: "numeric" }) })}>
      <span className="flex text-[#c9971f]" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarIcon key={i} className="h-4 w-4" />
        ))}
      </span>
      <span>
        {fill(d.hero.rating, { value })} · {fill(d.hero.ratingCount, { count: site.rating.count })}
      </span>
    </a>
  );
}

function SectionHead({ eyebrow, title, intro, center = false }: { eyebrow: string; title: string; intro?: string; center?: boolean }) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display mt-3 text-[2.4rem] md:text-[3.4rem]">{title}</h2>
      {intro && <p className="lead mt-4">{intro}</p>}
    </Reveal>
  );
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) return null;
  const d = getDict(lang);
  const order = pagePath("commander", lang);
  const hero = firstImg(["/media/hero/hero.jpg", "/media/hero/banh-mi-terrasse.jpg"])!;
  const serviceIcons = [<BagIcon key="b" className="h-7 w-7" />, <WhatsAppIcon key="w" className="h-7 w-7" />, <Illus key="h" name="hat" className="h-8 w-8" strokeWidth={5} />, <StarIcon key="s" className="h-7 w-7" />];
  const blocks = [
    { photo: ["/media/boutique/poulet-roti.jpg", "/media/plats/poulet-roti.jpg"], illus: "chicken" as const, tint: "red" as const, href: `/${lang}#carte-rotisserie`, ext: false },
    { photo: ["/media/boutique/baguettes-coriandre.jpg"], illus: "banhmi" as const, tint: "rice" as const, href: order, ext: false },
    { photo: ["/media/boutique/plateau.jpg"], illus: "tray" as const, tint: "herb" as const, href: waLink(d.blocks[2].quoteMessage ?? ""), ext: true },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd(lang)) }} />

      {/* 1. Hero : la plus belle photo, deux boutons, la note Google et le statut juste dessous */}
      <section className="grid lg:h-[calc(100svh-7.25rem)] lg:min-h-[640px] lg:grid-cols-[1fr_1.05fr]">
        <div className="relative order-1 h-[44svh] overflow-hidden lg:order-2 lg:h-auto">
          <Image src={hero.src} alt={altOf(d, hero.src)} width={hero.width} height={hero.height} sizes="(min-width: 1024px) 52vw, 100vw" quality={80} priority fetchPriority="high" className="h-full w-full object-cover object-[50%_78%]" />
        </div>
        <div className="order-2 flex flex-col justify-center px-5 pt-7 pb-12 md:px-10 lg:order-1 lg:px-14 xl:px-20">
          <p className="eyebrow rise">{d.hero.eyebrow}</p>
          <h1 className="display rise mt-4 text-[3rem] md:text-[4.4rem] xl:text-[5.4rem]" style={{ animationDelay: "0.05s" }}>
            {d.hero.title}
          </h1>
          <p className="lead rise mt-5 max-w-md" style={{ animationDelay: "0.1s" }}>
            {d.hero.sub}
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.15s" }}>
            <Link href={order} className="btn">
              <BagIcon className="h-5 w-5" />
              {d.hero.ctaOrder}
            </Link>
            <a href={`/${lang}#carte`} className="btn-line">
              {d.hero.ctaMenu}
            </a>
          </div>
          <div className="rise mt-6 flex flex-col gap-2 text-[0.9375rem] sm:flex-row sm:flex-wrap sm:gap-x-6" style={{ animationDelay: "0.2s" }}>
            <Rating lang={lang} d={d} />
            <OpenStatus className="font-medium" />
          </div>
        </div>
      </section>

      {/* 2. Tuiles de catégories */}
      <section aria-labelledby="tuiles" className="px-4 pt-10 md:px-8 md:pt-12">
        <h2 id="tuiles" className="sr-only">
          {d.tiles.title}
        </h2>
        <div className="mx-auto max-w-7xl">
          <Tiles lang={lang} d={d} />
        </div>
      </section>

      {/* 3. Bande de services en 4 pictos */}
      <section aria-labelledby="services" className="px-4 pt-10 md:px-8 md:pt-14">
        <h2 id="services" className="sr-only">
          {d.services.title}
        </h2>
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 border-y border-line py-8 md:grid-cols-4">
          {d.services.items.map((s, i) => (
            <li key={s.title} className="flex flex-col items-center px-3 text-center">
              <span className="text-red">{serviceIcons[i]}</span>
              <p className="mt-3 font-semibold">{s.title}</p>
              <p className="mt-1 text-[0.875rem] text-muted">{fill(s.text, { count: site.rating.count })}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. La carte : onglets, photo, prix en HTML, « Ajouter » */}
      <section id="carte" className="scroll-mt-20 px-4 pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <SectionHead eyebrow={d.carte.eyebrow} title={d.carte.title} intro={d.carte.intro} />
            <Link href={pagePath("carte", lang)} className="link-line shrink-0 self-start font-semibold md:self-auto">
              {d.carte.seeFull}
            </Link>
          </div>
          <MenuTabs />
          <p className="mt-2 text-sm text-muted">{fill(d.carte.checked, { date: formatDay(checked, lang, { day: "numeric", month: "long", year: "numeric" }) })}</p>
        </div>
      </section>

      {/* 5. Trois blocs alternés : photo, texte court, un seul bouton */}
      <section className="px-4 pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-7xl space-y-16 md:space-y-24">
          {d.blocks.map((b, i) => {
            const k = blocks[i];
            return (
              <div key={b.eyebrow} className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
                <Reveal className={i % 2 ? "md:order-2" : ""}>
                  <Photo paths={k.photo} alt={i === 1 ? altOf(d, "/media/boutique/baguettes-coriandre.jpg") : b.eyebrow} illus={k.illus} tint={k.tint} note={"photoNote" in b ? b.photoNote : undefined} sizes="(min-width: 768px) 46vw, 100vw" className="card aspect-[4/3] md:aspect-[5/4]" />
                </Reveal>
                <Reveal delay={0.05}>
                  <p className="eyebrow">{b.eyebrow}</p>
                  <h2 className="display mt-3 text-[2.2rem] md:text-[3rem]">{b.title}</h2>
                  <p className="lead mt-4 max-w-md">{b.text}</p>
                  {k.ext ? (
                    <a href={k.href} target="_blank" rel="noopener noreferrer" className="btn-line mt-7">
                      <WhatsAppIcon className="h-5 w-5" />
                      {b.cta}
                    </a>
                  ) : (
                    <Link href={k.href} className={i === 1 ? "btn mt-7" : "btn-line mt-7"}>
                      {b.cta}
                    </Link>
                  )}
                </Reveal>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Avis : la note Google, et de vrais avis seulement (data/avis.json) */}
      <section id="avis" className="px-4 pt-20 md:px-8 md:pt-28">
        <div dangerouslySetInnerHTML={{ __html: "<!-- À REMPLIR avec de vrais avis clients (data/avis.json) -->" }} hidden />
        <div className="mx-auto max-w-7xl rounded-[28px] bg-rice-soft px-6 py-14 text-center md:py-20">
          <p className="eyebrow">{d.reviews.eyebrow}</p>
          <p className="display mt-4 text-[5rem] leading-none text-red md:text-[7rem]">{new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB", { minimumFractionDigits: 1 }).format(site.rating.value)}</p>
          <div className="mt-3 flex justify-center text-[#c9971f]" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <StarIcon key={i} className="h-6 w-6" />
            ))}
          </div>
          <h2 className="display mx-auto mt-5 max-w-xl text-[2rem] md:text-[2.6rem]">{fill(d.reviews.title, { count: site.rating.count })}</h2>
          <p className="lead mx-auto mt-3 max-w-lg">{d.reviews.text}</p>
          {avis.items.length > 0 && (
            <ul className="mx-auto mt-10 grid max-w-5xl gap-4 text-start md:grid-cols-3">
              {(avis.items as { author: string; text: string }[]).map((a) => (
                <li key={a.author} className="card bg-paper p-6">
                  <p className="leading-relaxed">« {a.text} »</p>
                  <p className="mt-4 text-sm font-semibold">{a.author}</p>
                </li>
              ))}
            </ul>
          )}
          <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-line mt-8">
            {d.reviews.cta}
          </a>
        </div>
      </section>

      {/* 7. Infos pratiques */}
      <section id="infos" className="scroll-mt-20 px-4 pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <SectionHead eyebrow={d.infos.eyebrow} title={d.infos.title} />
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
            <Reveal className="card space-y-7 bg-cream-deep p-6 md:p-9">
              <div className="grid gap-7 sm:grid-cols-2">
                <div>
                  <p className="eyebrow mb-2">{d.infos.address}</p>
                  <address className="text-lg font-semibold not-italic">
                    {site.address.street}
                    <br />
                    {site.address.postalCode} {site.address.city}
                  </address>
                </div>
                <div>
                  <p className="eyebrow mb-2">{d.infos.phone}</p>
                  <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="link-line text-lg font-semibold">
                    {site.phone}
                  </a>
                </div>
              </div>
              <div>
                <p className="eyebrow mb-2">{d.infos.hours}</p>
                <HoursTable lang={lang} d={d} />
                <div className="mt-3 font-medium">
                  <OpenStatus />
                </div>
              </div>
              <div>
                <p className="eyebrow mb-2">{d.infos.access}</p>
                <p className="leading-relaxed text-muted">{d.infos.accessText}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-line">
                  <PinIcon className="h-5 w-5" />
                  {d.infos.route}
                </a>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="btn-line">
                  <PhoneIcon className="h-5 w-5" />
                  {d.nav.call}
                </a>
                <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-line">
                  <WhatsAppIcon className="h-5 w-5" />
                  {d.infos.whatsapp}
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.05} className="card flex min-h-96 flex-col bg-cream-deep">
              {firstImg(["/media/facade/devanture.jpg"]) && <Photo paths={["/media/facade/devanture.jpg"]} alt={d.infos.photoNote} illus="facade" sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[16/9]" />}
              <iframe title={d.infos.mapTitle} src={site.mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="min-h-96 w-full flex-1 border-0" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHead eyebrow={d.faq.eyebrow} title={d.faq.title} />
          <Reveal delay={0.05}>
            <div className="space-y-3">
              {d.faq.items.map((f) => (
                <details key={f.q} className="group card bg-paper ring-1 ring-line open:ring-red">
                  <summary className="flex min-h-16 items-center justify-between gap-6 px-5 py-4 font-[family-name:var(--font-display)] text-[1.1875rem] font-medium md:px-6">
                    {f.q}
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rice-soft">
                      <PlusIcon className="faq-plus h-4 w-4" />
                    </span>
                  </summary>
                  <p className="px-5 pb-6 leading-relaxed text-muted md:px-6">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
