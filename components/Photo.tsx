import Image from "next/image";
import { firstImg } from "@/lib/media";
import { Illus, type IllusName } from "@/components/Illus";

const TINTS = {
  rice: "bg-rice-soft text-red",
  red: "bg-red text-cream",
  herb: "bg-herb-soft text-herb-ink",
  cream: "bg-cream-deep text-red",
} as const;
export type Tint = keyof typeof TINTS;

/**
 * Photo d'un emplacement (plat, boutique, devanture…). Tant que la photo n'existe pas dans public/media,
 * un dessin au trait sur fond de couleur la remplace : déposez la photo dans assets/<dossier>/ et lancez npm run media.
 */
export function Photo({
  paths,
  alt,
  illus,
  tint = "rice",
  sizes,
  className = "",
  imgClassName = "",
  priority = false,
  note,
  illusClassName = "h-1/2 w-1/2 max-h-36 max-w-36",
}: {
  paths: readonly string[];
  alt: string;
  illus: IllusName;
  tint?: Tint;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  note?: string;
  illusClassName?: string;
}) {
  const p = firstImg(paths);
  if (p)
    return (
      <div className={`zoom bg-cream-deep ${className}`}>
        <Image src={p.src} alt={alt} width={p.width} height={p.height} sizes={sizes} quality={75} priority={priority} fetchPriority={priority ? "high" : undefined} className={`h-full w-full object-cover ${imgClassName}`} />
      </div>
    );
  return (
    <div className={`relative flex items-center justify-center ${TINTS[tint]} ${className}`} data-photo-slot={paths[0]} data-photo-note={note} role="img" aria-label={alt}>
      <Illus name={illus} className={illusClassName} strokeWidth={2.6} />
    </div>
  );
}
