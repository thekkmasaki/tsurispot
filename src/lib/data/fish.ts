import type { FishSpecies } from "@/types";
import { seaFish } from "./fish-sea";
import { freshwaterFish } from "./fish-freshwater";
import { brackishFish } from "./fish-brackish";

export const fishSpecies: FishSpecies[] = [
  ...seaFish,
  ...freshwaterFish,
  ...brackishFish,
];

export function getFishBySlug(slug: string): FishSpecies | undefined {
  return fishSpecies.find((f) => f.slug === slug);
}

export function getCatchableNow(month: number): FishSpecies[] {
  return fishSpecies.filter((f) => f.seasonMonths.includes(month));
}

export function getPeakFish(month: number): FishSpecies[] {
  return fishSpecies.filter((f) => f.peakMonths.includes(month));
}
