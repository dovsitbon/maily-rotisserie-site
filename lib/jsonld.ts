import site from "@/data/site.json";
import { getDict, locales, type Locale } from "@/lib/i18n";
import { weekHours } from "@/lib/hours";
import { CATEGORIES, ITEMS } from "@/lib/carte";
import { pagePath, type PageId } from "@/lib/pages";

const BUSINESS = `${site.url}/#restaurant`;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function menu(lang: Locale) {
  const d = getDict(lang);
  return {
    "@type": "Menu",
    "@id": `${site.url}${pagePath("carte", lang)}#menu`,
    name: d.pages.carte.title,
    inLanguage: lang,
    hasMenuSection: CATEGORIES.map((c) => ({
      "@type": "MenuSection",
      name: d.carte.tabs[c.id],
      hasMenuItem: c.items.map((id) => {
        const it = ITEMS[id];
        return {
          "@type": "MenuItem",
          name: d.products[id].name,
          description: d.products[id].desc,
          ...(it.tags.includes("vege") ? { suitableForDiet: "https://schema.org/VegetarianDiet" } : it.tags.includes("halal") ? { suitableForDiet: "https://schema.org/HalalDiet" } : {}),
          ...(it.price !== null ? { offers: { "@type": "Offer", price: it.price.toFixed(2), priceCurrency: "EUR" } } : {}),
        };
      }),
    })),
  };
}

export function business(lang: Locale) {
  const d = getDict(lang);
  return {
    "@type": "Restaurant",
    "@id": BUSINESS,
    name: site.fullName,
    alternateName: ["Maily", "Maily Rôtisserie", "Maily rôtisserie vietnamienne Amiens"],
    description: d.meta.description,
    url: `${site.url}/${lang}`,
    image: [`${site.url}/og.jpg`, `${site.url}/media/hero/banh-mi-terrasse.jpg`],
    logo: `${site.url}/logo.svg`,
    telephone: site.phoneIntl,
    priceRange: "€",
    servesCuisine: ["Vietnamese", "Vietnamienne", "Banh mi", "Bo bun"],
    address: { "@type": "PostalAddress", streetAddress: site.address.street, postalCode: site.address.postalCode, addressLocality: site.address.city, addressRegion: site.address.region, addressCountry: site.address.country },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    openingHoursSpecification: weekHours().flatMap((slots, i) => slots.map(([opens, closes]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${DAYS[i]}`, opens, closes }))),
    // Note Google relevée à la main (data/site.json → rating.checked)
    aggregateRating: { "@type": "AggregateRating", ratingValue: site.rating.value, reviewCount: site.rating.count, bestRating: 5, worstRating: 1, dateModified: site.rating.checked },
    sameAs: [site.instagram],
    acceptsReservations: false,
    currenciesAccepted: "EUR",
    hasMenu: { "@id": `${site.url}${pagePath("carte", lang)}#menu` },
    amenityFeature: [{ "@type": "LocationFeatureSpecification", name: lang === "fr" ? "Vente à emporter" : "Takeaway", value: true }],
    potentialAction: { "@type": "OrderAction", target: `${site.url}${pagePath("commander", lang)}`, deliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModePickUp" },
  };
}

/** Accueil : site, restaurant (horaires, note Google datée, carte), FAQ. */
export function homeJsonLd(lang: Locale) {
  const d = getDict(lang);
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.fullName, inLanguage: [...locales], publisher: { "@id": BUSINESS } },
      business(lang),
      menu(lang),
      { "@type": "FAQPage", mainEntity: d.faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
}

/** Page secondaire : restaurant, carte si utile, fil d'Ariane. */
export function pageJsonLd(lang: Locale, id: PageId) {
  const d = getDict(lang);
  const title = id === "banhMi" || id === "boBun" ? d.pages[id].eyebrow : d.pages[id].title;
  return {
    "@context": "https://schema.org",
    "@graph": [
      business(lang),
      ...(id === "carte" || id === "banhMi" || id === "boBun" ? [menu(lang)] : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: site.name, item: `${site.url}/${lang}` },
          { "@type": "ListItem", position: 2, name: title, item: `${site.url}${pagePath(id, lang)}` },
        ],
      },
    ],
  };
}
