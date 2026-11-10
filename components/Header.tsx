"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import site from "@/data/site.json";
import { Logo } from "@/components/Logo";
import { LangSwitch } from "@/components/LangSwitch";
import { BagIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { useCart } from "@/lib/cart";
import { fill } from "@/lib/i18n";
import { pagePath } from "@/lib/pages";

function OrderButton({ className = "" }: { className?: string }) {
  const { lang, d } = useLocale();
  const { count, ready } = useCart();
  return (
    <Link href={pagePath("commander", lang)} className={`btn relative ${className}`} aria-label={ready && count ? `${d.nav.orderCta} · ${fill(d.nav.cartCount, { count })}` : undefined}>
      <BagIcon className="h-5 w-5" />
      {d.nav.orderCta}
      {ready && count > 0 && (
        <span className="ms-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-rice px-1.5 text-[0.8125rem] font-bold text-ink" aria-hidden="true">
          {count}
        </span>
      )}
    </Link>
  );
}

export function Header() {
  const { lang, d } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const home = `/${lang}`;
  const links = [
    { href: `${home}#carte`, label: d.nav.carte },
    { href: pagePath("commander", lang), label: d.nav.order },
    { href: `${home}#infos`, label: d.nav.infos },
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 bg-cream/95 backdrop-blur-sm transition-shadow duration-300 ${scrolled ? "shadow-[0_1px_0_var(--color-line)]" : ""}`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-10 focus:rounded-full focus:bg-cream focus:px-4 focus:py-2">
          {d.nav.skip}
        </a>
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 md:h-[4.75rem] md:px-6 xl:px-8">
          <div className="flex items-center">
            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full lg:hidden" onClick={() => setMenu(true)} aria-label={d.nav.menu} aria-expanded={menu}>
              <MenuIcon className="h-6 w-6" />
            </button>
            <nav className="hidden items-center gap-1 lg:flex" aria-label={d.nav.menu}>
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-full px-3 py-2 text-[0.9375rem] font-medium whitespace-nowrap transition-colors hover:bg-cream-deep">
                  {l.label}
                </Link>
              ))}
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.9375rem] font-medium hover:bg-cream-deep">
                <InstagramIcon className="h-4 w-4" />
                {d.nav.instagram}
              </a>
            </nav>
          </div>

          <Link href={home} aria-label={d.nav.home} className="block py-1">
            <Logo />
          </Link>

          <div className="flex items-center justify-end gap-1 lg:gap-3">
            <LangSwitch lang={lang} label={d.nav.lang} className="hidden lg:flex" />
            <a href={`tel:${site.phoneIntl}`} className="hidden items-center gap-2 rounded-full px-3 py-2 text-[0.9375rem] font-medium whitespace-nowrap hover:bg-cream-deep xl:inline-flex">
              <PhoneIcon className="h-4 w-4" />
              {site.phone}
            </a>
            <a href={`tel:${site.phoneIntl}`} className="flex h-11 w-11 items-center justify-center rounded-full xl:hidden" aria-label={`${d.nav.call} ${site.phone}`}>
              <PhoneIcon className="h-5 w-5" />
            </a>
            <OrderButton className="hidden !min-h-11 !px-5 md:inline-flex" />
          </div>
        </div>
      </header>

      {menu && (
        <div className="fade-in fixed inset-0 z-[60] flex flex-col overscroll-contain bg-cream text-ink" role="dialog" aria-modal="true" aria-label={d.nav.menu}>
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center px-3">
            <button type="button" className="flex h-11 w-11 items-center justify-center justify-self-start rounded-full" onClick={() => setMenu(false)} aria-label={d.nav.close}>
              <CloseIcon className="h-6 w-6" />
            </button>
            <Logo />
            <span />
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center gap-2" aria-label={d.nav.menu}>
            {links.map((l, i) => (
              <div key={l.href} className="rise" style={{ animationDelay: `${0.04 * i}s` }}>
                <Link href={l.href} onClick={() => setMenu(false)} className="display block px-4 py-1 text-[2.4rem]">
                  {l.label}
                </Link>
              </div>
            ))}
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="display rise px-4 py-1 text-[2.4rem]" style={{ animationDelay: "0.12s" }}>
              {d.nav.instagram}
            </a>
          </nav>
          {/* Raccourcis : Commander, Appeler, Itinéraire */}
          <div className="grid grid-cols-3 gap-2 px-4 pb-3">
            <Link href={pagePath("commander", lang)} onClick={() => setMenu(false)} className="btn !px-2 !text-[0.9375rem]">
              {d.nav.orderCta}
            </Link>
            <a href={`tel:${site.phoneIntl}`} className="btn-line !px-2 !text-[0.9375rem]">
              <PhoneIcon className="h-4 w-4" />
              {d.nav.call}
            </a>
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-line !px-2 !text-[0.9375rem]">
              <PinIcon className="h-4 w-4" />
              {d.nav.route}
            </a>
          </div>
          <div className="flex items-center justify-center border-t border-line px-4 py-2">
            <LangSwitch lang={lang} label={d.nav.lang} />
          </div>
        </div>
      )}
    </>
  );
}

/** Barre fixée en bas de l'écran sur mobile : « Commander » toujours à portée de pouce, et l'appel. */
export function MobileOrderBar() {
  const { d } = useLocale();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-cream/95 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden">
      <OrderButton className="flex-1 !px-3" />
      <a href={`tel:${site.phoneIntl}`} className="btn-line !px-4" aria-label={`${d.nav.call} ${site.phone}`}>
        <PhoneIcon className="h-5 w-5" />
        {d.nav.call}
      </a>
    </div>
  );
}

/** Petit message « Banh mi poulet ajouté » après un ajout, avec un lien vers la commande. */
export function CartToast() {
  const { lang, d } = useLocale();
  const { toast } = useCart();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={`${toast.item}-${toast.n}`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            className="pointer-events-auto flex items-center gap-4 rounded-full bg-ink py-2 ps-5 pe-2 text-cream shadow-lg"
          >
            <span className="text-[0.9375rem]">{fill(d.order.toast, { name: d.products[toast.item].name })}</span>
            <Link href={pagePath("commander", lang)} className="rounded-full bg-rice px-4 py-2 text-[0.875rem] font-semibold whitespace-nowrap text-ink">
              {d.order.toastCta}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
