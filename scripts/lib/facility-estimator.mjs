/**
 * facility-estimator.mjs
 * スポットの施設フラグからDetectedFacility[]を生成
 *
 * DetectedFacility型（types.tsより）:
 * { id: string, name: string, icon: string, relativePosition: number }
 */

/**
 * スポットデータの施設フラグからDetectedFacility配列を生成
 * @param {object} spotData - { hasParking, hasToilet, hasFishingShop, hasConvenienceStore, hasRentalRod }
 * @returns {Array} DetectedFacility[]
 */
export function estimateFacilities(spotData) {
  const facilities = [];
  let pos = 0.05;
  const step = 0.07;

  if (spotData.hasParking) {
    facilities.push({
      id: 'fac-parking',
      name: '駐車場',
      icon: '🅿️',
      relativePosition: pos,
    });
    pos += step;
  }

  if (spotData.hasToilet) {
    facilities.push({
      id: 'fac-toilet',
      name: 'トイレ',
      icon: '🚻',
      relativePosition: pos,
    });
    pos += step;
  }

  if (spotData.hasFishingShop) {
    facilities.push({
      id: 'fac-shop',
      name: '釣具店',
      icon: '🏣',
      relativePosition: pos,
    });
    pos += step;
  }

  if (spotData.hasConvenienceStore) {
    facilities.push({
      id: 'fac-convenience',
      name: 'コンビニ',
      icon: '🏪',
      relativePosition: pos,
    });
    pos += step;
  }

  if (spotData.hasRentalRod) {
    facilities.push({
      id: 'fac-rental',
      name: 'レンタル竿',
      icon: '🎣',
      relativePosition: pos,
    });
  }

  return facilities;
}
