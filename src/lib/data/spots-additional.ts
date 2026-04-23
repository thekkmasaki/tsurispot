import { additionalSpotsHokkaido } from './spots-additional-hokkaido';
import { additionalSpotsTohoku } from './spots-additional-tohoku';
import { additionalSpotsKanto } from './spots-additional-kanto';
import { additionalSpotsChubu } from './spots-additional-chubu';
import { additionalSpotsKinki } from './spots-additional-kinki';
import { additionalSpotsChugokuShikoku } from './spots-additional-chugoku-shikoku';
import { additionalSpotsKyushu } from './spots-additional-kyushu';
import { additionalSpotsOkinawa } from './spots-additional-okinawa';
import type { FishingSpot } from "@/types";

export const additionalSpots: FishingSpot[] = [
  ...additionalSpotsHokkaido,
  ...additionalSpotsTohoku,
  ...additionalSpotsKanto,
  ...additionalSpotsChubu,
  ...additionalSpotsKinki,
  ...additionalSpotsChugokuShikoku,
  ...additionalSpotsKyushu,
  ...additionalSpotsOkinawa,
];
