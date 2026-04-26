import { FishingSpot } from "@/types";
import { _baseSpots } from "./spots-base";
import { additionalSpots } from "./spots-additional";
import { osakaKinkiSpots } from "./spots-osaka-kinki";
import { extraSpots } from "./spots-extra";
import { sagamiMiuraSpots } from "./spots-sagami-miura";
import { sagamiShonanSpots } from "./spots-sagami-shonan";
import { sagamiIzuSpots } from "./spots-sagami-izu";
import { tohokuSpots } from "./spots-tohoku";
import { hokurikuSpots } from "./spots-hokuriku";
import { shikokuSpots } from "./spots-shikoku";
import { kyushuSouthSpots } from "./spots-kyushu-south";
import { okinawaSpots } from "./spots-okinawa";
import { saninSpots } from "./spots-sanin";
import { tokaiDetailSpots } from "./spots-tokai-detail";
import { kyushuChugokuDetailSpots } from "./spots-kyushu-chugoku-detail";
import { kantoDetailSpots } from "./spots-kanto-detail";
import { kansaiDetailSpots } from "./spots-kansai-detail";
import { hokkaidoTohokuDetailSpots } from "./spots-hokkaido-tohoku-detail";
import { hyogoDetailSpots } from "./spots-hyogo-detail";
import { southKyushuDetailSpots } from "./spots-south-kyushu-detail";
import { chibaShizuokaDetailSpots } from "./spots-chiba-shizuoka-detail";
import { wakayamaMieNiigataSpots } from "./spots-wakayama-mie-niigata";
import { aichiFukuokaHiroshimaSpots } from "./spots-aichi-fukuoka-hiroshima";
import { akashiHarimaSpots } from "./spots-akashi-harima";
import { freshwaterSpots } from "./spots-freshwater";
import { freshwaterSpotsTohoku } from "./spots-freshwater-tohoku";
import { freshwaterSpotsWest } from "./spots-freshwater-west";
import { freshwaterSpotsKantoAdd } from "./spots-freshwater-kanto-add";
import { freshwaterSpotsChubuAdd } from "./spots-freshwater-chubu-add";
import { freshwaterSpotsWestAdd } from "./spots-freshwater-west-add";
import { freshwaterSpotsKyoto } from "./spots-freshwater-kyoto";
import { freshwaterSpotsTohokuAdd } from "./spots-freshwater-tohoku-add";
import { freshwaterSpotsChubuKansaiAdd } from "./spots-freshwater-chubu-kansai-add";
import { freshwaterSpotsLowland } from "./spots-freshwater-lowland";
import { freshwaterSpotsLowland2 } from "./spots-freshwater-lowland2";
import { kinkiChugokuShikokuAddSpots } from "./spots-kinki-chugoku-shikoku-add";
import { hokkaidoTohokuAdd2Spots } from "./spots-hokkaido-tohoku-add2";
import { chugokuShikokuKyushuAdd2Spots } from "./spots-chugoku-shikoku-kyushu-add2";
import { kantoKoshinetsuAdd2Spots } from "./spots-kanto-koshinetsu-add2";
import { chubuKinkiAdd2Spots } from "./spots-chubu-kinki-add2";
import { chubuKinkiAdd3Spots } from "./spots-chubu-kinki-add3";
import { chugokuKyushuOkinawaAdd3Spots } from "./spots-chugoku-kyushu-okinawa-add3";
import { hokkaidoTohokuHokurikuAdd3Spots } from "./spots-hokkaido-tohoku-hokuriku-add3";
import { kantoKoshinetsuAdd3Spots } from "./spots-kanto-koshinetsu-add3";
import { freshwaterSpotsMajor } from "./spots-freshwater-major";
import { expandKyushuSpots } from "./spots-expand-kyushu";
import { expandNorthSpots } from "./spots-expand-north";
import { expandWestSpots } from "./spots-expand-west";
import { expandCentralSpots } from "./spots-expand-central";
import { kitakinkiSpots } from "./spots-kitakinki";
import { northAdd4Spots } from "./spots-add4-north";
import { kantoAdd4Spots } from "./spots-add4-kanto";
import { chubuKinkiAdd4Spots } from "./spots-add4-chubu-kinki";
import { chugokuShikokuAdd4Spots } from "./spots-add4-chugoku-shikoku";
import { kyushuOkinawaAdd4Spots } from "./spots-add4-kyushu-okinawa";
import { kobeKakogawaAddSpots } from "./spots-kobe-kakogawa-add";
import { awajiDetailSpots } from "./spots-awaji-detail";
import { himejiHarimaDetailSpots } from "./spots-himeji-harima-detail";
import { eastAdd5Spots } from "./spots-add5-east";
import { eastAdd5Spots2 } from "./spots-add5-east2";
import { eastAdd5Spots3 } from "./spots-add5-east3";
import { centralAdd5Spots } from "./spots-add5-central";
import { westAdd5Spots } from "./spots-add5-west";
import { tokyoOsakaBaySpots } from "./spots-tokyo-osaka-bay";
import { freshwaterSpotsAdd2 } from "./spots-freshwater-add2";
import { freshwaterSpotsAdd3 } from "./spots-freshwater-add3";
import { freshwaterSpotsAdd4 } from "./spots-freshwater-add4";
import { eastAdd6Spots } from "./spots-add6-east";
import { centralAdd6Spots } from "./spots-add6-central";
import { westAdd6Spots } from "./spots-add6-west";
import { westAdd7Spots } from "./spots-add7-west";
import { hokkaidoTohokuAdd8Spots } from "./spots-add8-hokkaido-tohoku";
import { kantoAdd8Spots } from "./spots-add8-kanto-chubu";
import { kinkiAdd8Spots } from "./spots-add8-kinki";
import { chugokuShikokuAdd8Spots } from "./spots-add8-chugoku-shikoku";
import { kyushuOkinawaAdd8Spots } from "./spots-add8-kyushu-okinawa";
import { eastAdd9Spots } from "./spots-add9-east";
import { centralAdd9Spots } from "./spots-add9-central";
import { westAdd9Spots } from "./spots-add9-west";
import { northAdd10Spots } from "./spots-add10-north";
import { eastAdd10Spots } from "./spots-add10-east";
import { westAdd10Spots } from "./spots-add10-west";

export const allRawSpots: FishingSpot[] = [
  ..._baseSpots,
  ...additionalSpots,
  ...osakaKinkiSpots,
  ...extraSpots,
  ...sagamiMiuraSpots,
  ...sagamiShonanSpots,
  ...sagamiIzuSpots,
  ...tohokuSpots,
  ...hokurikuSpots,
  ...shikokuSpots,
  ...kyushuSouthSpots,
  ...okinawaSpots,
  ...saninSpots,
  ...tokaiDetailSpots,
  ...kyushuChugokuDetailSpots,
  ...kantoDetailSpots,
  ...kansaiDetailSpots,
  ...hokkaidoTohokuDetailSpots,
  ...hyogoDetailSpots,
  ...southKyushuDetailSpots,
  ...chibaShizuokaDetailSpots,
  ...wakayamaMieNiigataSpots,
  ...aichiFukuokaHiroshimaSpots,
  ...akashiHarimaSpots,
  ...freshwaterSpots,
  ...freshwaterSpotsTohoku,
  ...freshwaterSpotsWest,
  ...freshwaterSpotsKantoAdd,
  ...freshwaterSpotsChubuAdd,
  ...freshwaterSpotsWestAdd,
  ...freshwaterSpotsKyoto,
  ...freshwaterSpotsTohokuAdd,
  ...freshwaterSpotsChubuKansaiAdd,
  ...freshwaterSpotsLowland,
  ...freshwaterSpotsLowland2,
  ...kinkiChugokuShikokuAddSpots,
  ...hokkaidoTohokuAdd2Spots,
  ...chugokuShikokuKyushuAdd2Spots,
  ...kantoKoshinetsuAdd2Spots,
  ...chubuKinkiAdd2Spots,
  ...chubuKinkiAdd3Spots,
  ...chugokuKyushuOkinawaAdd3Spots,
  ...hokkaidoTohokuHokurikuAdd3Spots,
  ...kantoKoshinetsuAdd3Spots,
  ...freshwaterSpotsMajor,
  ...expandKyushuSpots,
  ...expandNorthSpots,
  ...expandWestSpots,
  ...expandCentralSpots,
  ...kitakinkiSpots,
  ...northAdd4Spots,
  ...kantoAdd4Spots,
  ...chubuKinkiAdd4Spots,
  ...chugokuShikokuAdd4Spots,
  ...kyushuOkinawaAdd4Spots,
  ...kobeKakogawaAddSpots,
  ...himejiHarimaDetailSpots,
  ...awajiDetailSpots,
  ...eastAdd5Spots,
  ...eastAdd5Spots2,
  ...eastAdd5Spots3,
  ...centralAdd5Spots,
  ...westAdd5Spots,
  ...tokyoOsakaBaySpots,
  ...freshwaterSpotsAdd2,
  ...freshwaterSpotsAdd3,
  ...freshwaterSpotsAdd4,
  ...eastAdd6Spots,
  ...centralAdd6Spots,
  ...westAdd6Spots,
  ...westAdd7Spots,
  ...hokkaidoTohokuAdd8Spots,
  ...kantoAdd8Spots,
  ...kinkiAdd8Spots,
  ...chugokuShikokuAdd8Spots,
  ...kyushuOkinawaAdd8Spots,
  ...eastAdd9Spots,
  ...centralAdd9Spots,
  ...westAdd9Spots,
  ...northAdd10Spots,
  ...eastAdd10Spots,
  ...westAdd10Spots,
];
