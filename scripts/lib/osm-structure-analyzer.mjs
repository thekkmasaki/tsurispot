/**
 * Haversine distance between two coordinates in meters.
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Tag relevance rules per spot type.
 */
const TAG_RELEVANCE = {
  port: (tags) =>
    ['breakwater', 'quay'].includes(tags['man_made']) || tags['landuse'] === 'harbour' ? 0.5
    : tags['leisure'] === 'fishing' ? 0.5
    : tags['leisure'] === 'park' && /釣り|海釣り|fishing/i.test(tags['name'] || '') ? 0.45
    : tags['man_made'] === 'pier' ? 0.4
    : 0,
  breakwater: (tags) =>
    ['breakwater', 'groyne'].includes(tags['man_made']) ? 0.5
    : tags['leisure'] === 'fishing' ? 0.5
    : tags['leisure'] === 'park' && /釣り|海釣り|fishing/i.test(tags['name'] || '') ? 0.45
    : tags['man_made'] === 'pier' ? 0.4
    : 0,
  pier: (tags) =>
    ['pier', 'jetty'].includes(tags['man_made']) ? 0.5
    : tags['leisure'] === 'fishing' ? 0.4
    : 0,
  beach: (tags) =>
    tags['natural'] === 'beach' ? 0.5 : 0,
  rocky: (tags) =>
    tags['natural'] === 'cliff' || tags['geological'] === 'rock' ? 0.5 : 0,
  river: (tags) =>
    ['river', 'canal'].includes(tags['waterway']) || tags['man_made'] === 'quay' ? 0.5 : 0,
};

/**
 * Find the center point of a Way's nodes.
 */
function wayCenter(wayNodes, nodeMap) {
  let sumLat = 0, sumLng = 0, count = 0;
  for (const nid of wayNodes) {
    const node = nodeMap.get(nid);
    if (node) {
      sumLat += node.lat;
      sumLng += node.lon;
      count++;
    }
  }
  if (count === 0) return null;
  return { lat: sumLat / count, lng: sumLng / count };
}

/**
 * Calculate total length of a Way in meters.
 */
export function calculateLength(wayNodes, nodeMap) {
  let total = 0;
  for (let i = 1; i < wayNodes.length; i++) {
    const a = nodeMap.get(wayNodes[i - 1]);
    const b = nodeMap.get(wayNodes[i]);
    if (a && b) {
      total += haversineDistance(a.lat, a.lon, b.lat, b.lon);
    }
  }
  return total;
}

/**
 * Extract west/east endpoints from a Way (sorted by longitude).
 * For closed polygons, extract the two most distant points along the long axis.
 */
export function extractEndpoints(wayNodes, nodeMap) {
  const coords = [];
  for (const nid of wayNodes) {
    const node = nodeMap.get(nid);
    if (node) {
      coords.push({ lat: node.lat, lng: node.lon });
    }
  }
  if (coords.length < 2) return null;

  // Check if this is a closed polygon (first node == last node or very close)
  const isPolygon = wayNodes.length > 3 && wayNodes[0] === wayNodes[wayNodes.length - 1];

  if (isPolygon && coords.length > 4) {
    // For polygons (e.g., leisure=park), find the two farthest points
    // This gives us the long axis of the structure
    let maxDist = 0;
    let bestA = coords[0], bestB = coords[1];
    for (let i = 0; i < coords.length; i++) {
      for (let j = i + 1; j < coords.length; j++) {
        const d = haversineDistance(coords[i].lat, coords[i].lng, coords[j].lat, coords[j].lng);
        if (d > maxDist) {
          maxDist = d;
          bestA = coords[i];
          bestB = coords[j];
        }
      }
    }
    // Return west/east based on longitude
    if (bestA.lng <= bestB.lng) {
      return { west: bestA, east: bestB };
    } else {
      return { west: bestB, east: bestA };
    }
  }

  // Linear way: westernmost and easternmost nodes
  coords.sort((a, b) => a.lng - b.lng);
  return {
    west: coords[0],
    east: coords[coords.length - 1],
  };
}

/**
 * Determine layout type from OSM tags and spot type.
 */
export function determineLayoutType(tags, spotType) {
  if (tags['man_made'] === 'breakwater' || tags['man_made'] === 'groyne') return 'seawall';
  if (tags['man_made'] === 'pier' || tags['man_made'] === 'jetty') return 'pier';
  if (tags['natural'] === 'beach') return 'beach';
  if (tags['man_made'] === 'quay' || tags['landuse'] === 'harbour') return 'port';

  // Fallback by spotType
  const fallback = {
    port: 'port',
    beach: 'beach',
    rocky: 'seawall',
    pier: 'pier',
    breakwater: 'seawall',
    river: 'port',
  };
  return fallback[spotType] || 'seawall';
}

/**
 * Score and select the best Way element.
 */
export function findBestWay(elements, lat, lng, spotType) {
  const ways = elements.filter(e => e.type === 'way');
  const nodeMap = new Map();
  for (const e of elements) {
    if (e.type === 'node') {
      nodeMap.set(e.id, e);
    }
  }

  if (ways.length === 0) return null;

  // Compute max distance for normalization
  let maxDistance = 0;
  const wayInfos = ways.map(way => {
    const center = wayCenter(way.nodes || [], nodeMap);
    const dist = center ? haversineDistance(lat, lng, center.lat, center.lng) : Infinity;
    if (dist !== Infinity && dist > maxDistance) maxDistance = dist;
    return { way, center, dist, nodeMap };
  });

  if (maxDistance === 0) maxDistance = 1; // avoid division by zero

  let bestScore = -1;
  let bestWay = null;

  for (const { way, dist } of wayInfos) {
    if (dist === Infinity) continue;

    const tags = way.tags || {};
    const nodes = way.nodes || [];

    // Distance score: closer is better
    const distScore = 1 - (dist / maxDistance);

    // Tag relevance
    const tagFn = TAG_RELEVANCE[spotType];
    const tagScore = tagFn ? tagFn(tags) : 0;

    // Length score: prefer ways >= 50m
    const length = calculateLength(nodes, nodeMap);
    const lengthScore = length >= 50 ? 0.3 : 0;

    // Combined score
    const score = distScore * 0.4 + tagScore * 0.4 + lengthScore * 0.2;

    if (score > bestScore) {
      bestScore = score;
      bestWay = way;
    }
  }

  if (bestScore < 0.2) return null;

  return { way: bestWay, score: bestScore, nodeMap };
}

/**
 * Analyze OSM data and extract structure information.
 *
 * Returns: {
 *   endpoints: { west: {lat, lng}, east: {lat, lng} },
 *   layoutType: 'seawall' | 'pier' | 'port' | 'beach',
 *   structureLength: number (meters),
 *   tags: object,
 *   wayId: number,
 *   confidence: number
 * } or null
 */
export function analyzeOsmData(osmData, lat, lng, spotType) {
  if (!osmData || !osmData.elements || osmData.elements.length === 0) {
    return null;
  }

  const result = findBestWay(osmData.elements, lat, lng, spotType);
  if (!result) return null;

  const { way, score, nodeMap } = result;
  const nodes = way.nodes || [];
  const tags = way.tags || {};

  const endpoints = extractEndpoints(nodes, nodeMap);
  const structureLength = calculateLength(nodes, nodeMap);
  const layoutType = determineLayoutType(tags, spotType);

  return {
    endpoints,
    layoutType,
    structureLength: Math.round(structureLength),
    tags,
    wayId: way.id,
    confidence: Math.round(score * 100) / 100,
  };
}
