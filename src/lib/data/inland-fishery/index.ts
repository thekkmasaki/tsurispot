import type { InlandFisheryCoop, InlandFisherySpotLink } from "./types";
import { KYOTO_COOPS, KYOTO_SPOT_LINKS } from "./kyoto";

export type { InlandFisheryCoop, InlandFisherySpotLink } from "./types";

/** 都道府県ごとのデータ。県を足すときはここに並べる */
const PREFECTURES: { coops: InlandFisheryCoop[]; links: Record<string, InlandFisherySpotLink> }[] = [
  { coops: KYOTO_COOPS, links: KYOTO_SPOT_LINKS },
];

export const inlandFisheryCoops: InlandFisheryCoop[] = PREFECTURES.flatMap((p) => p.coops);

const coopById = new Map(inlandFisheryCoops.map((c) => [c.id, c]));

export const inlandFisherySpotLinks: Record<string, InlandFisherySpotLink> = Object.assign(
  {},
  ...PREFECTURES.map((p) => p.links),
);

export function getInlandFisheryCoop(id: string): InlandFisheryCoop | undefined {
  return coopById.get(id);
}

export type SpotInlandFishery =
  | { kind: "coop"; coop: InlandFisheryCoop; link: Extract<InlandFisherySpotLink, { coopId: string }> }
  | { kind: "outside"; link: Extract<InlandFisherySpotLink, { outside: true }> };

/** スポットの管轄漁協（未確認なら undefined） */
export function getSpotInlandFishery(slug: string): SpotInlandFishery | undefined {
  const link = inlandFisherySpotLinks[slug];
  if (!link) return undefined;
  if ("outside" in link) return { kind: "outside", link };
  const coop = coopById.get(link.coopId);
  return coop ? { kind: "coop", coop, link } : undefined;
}
