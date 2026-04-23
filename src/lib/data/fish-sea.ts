import type { FishSpecies } from "@/types";
import { seaFishPopular } from "./fish-sea-popular";
import { seaFishKaiyuu } from "./fish-sea-kaiyuu";
import { seaFishTaiSuzuki } from "./fish-sea-tai-suzuki";
import { seaFishRootHata } from "./fish-sea-root-hata";
import { seaFishIkaTako } from "./fish-sea-ika-tako";

export const seaFish: FishSpecies[] = [
  ...seaFishPopular,
  ...seaFishKaiyuu,
  ...seaFishTaiSuzuki,
  ...seaFishRootHata,
  ...seaFishIkaTako,
];
