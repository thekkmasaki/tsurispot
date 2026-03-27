import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];
const CACHE_DIR = path.join(__dirname, '..', '..', 'patent', 'data', 'cache');
const CACHE_TTL_DAYS = 30;

// Rate limiting: minimum 1.5s between requests
let lastRequestTime = 0;

const SPOT_TYPE_TAGS = {
  port: [
    'way["man_made"="breakwater"]',
    'way["man_made"="quay"]',
    'way["harbour"="yes"]',
    'way["landuse"="harbour"]',
    'way["leisure"="fishing"]',
    'way["leisure"="park"]',
    'way["man_made"="pier"]',
  ],
  breakwater: [
    'way["man_made"="breakwater"]',
    'way["man_made"="groyne"]',
    'way["leisure"="fishing"]',
    'way["leisure"="park"]',
  ],
  pier: [
    'way["man_made"="pier"]',
    'way["man_made"="jetty"]',
    'way["leisure"="fishing"]',
  ],
  beach: [
    'way["natural"="beach"]',
    'way["natural"="coastline"]',
  ],
  rocky: [
    'way["natural"="cliff"]',
    'way["natural"="coastline"]',
    'way["geological"="rock"]',
  ],
  river: [
    'way["waterway"="river"]',
    'way["waterway"="canal"]',
    'way["man_made"="quay"]',
  ],
  default: [
    'way["man_made"~"breakwater|quay|pier"]',
    'way["natural"~"coastline|beach"]',
    'way["leisure"="fishing"]',
    'way["leisure"="park"]',
  ],
};

function buildQuery(lat, lng, radius, spotType) {
  const tags = SPOT_TYPE_TAGS[spotType] || SPOT_TYPE_TAGS.default;
  const statements = tags
    .map(tag => `  ${tag}(around:${radius},${lat},${lng});`)
    .join('\n');

  return `[out:json][timeout:25];
(
${statements}
);
out body;
>;
out skel qt;`;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function rateLimitWait() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1500) {
    await sleep(1500 - elapsed);
  }
  lastRequestTime = Date.now();
}

/**
 * Query Overpass API with retry and exponential backoff.
 * Returns parsed JSON or null on failure.
 */
export async function queryOverpass(lat, lng, radius, spotType) {
  const effectiveRadius = spotType === 'beach' ? Math.max(radius, 1000) : (radius || 500);
  const query = buildQuery(lat, lng, effectiveRadius, spotType);

  // 各エンドポイントを順に試行
  for (const url of OVERPASS_URLS) {
    const maxRetries = 2;
    const baseDelay = 3000;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      await rateLimitWait();

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          return await response.json();
        }

        if (response.status === 429 || response.status === 504) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(`Overpass ${url.split('/')[2]} ${response.status}, retry in ${delay / 1000}s`);
          await sleep(delay);
          continue;
        }

        console.warn(`Overpass ${url.split('/')[2]} error: ${response.status}`);
        break; // 他のエンドポイントへ
      } catch (err) {
        if (err.name === 'AbortError') {
          console.warn(`Overpass ${url.split('/')[2]} timeout, trying next endpoint`);
          break;
        }
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(`Overpass request failed: ${err.message}, retry in ${delay / 1000}s`);
          await sleep(delay);
          continue;
        }
        console.warn(`Overpass ${url.split('/')[2]} failed: ${err.message}`);
        break;
      }
    }
  }

  console.error(`All Overpass endpoints failed for (${lat}, ${lng})`);
  return null;
}

/**
 * Query with file-based caching (TTL: 30 days).
 */
export async function queryWithCache(slug, lat, lng, radius, spotType) {
  const cacheFile = path.join(CACHE_DIR, `${slug}.overpass.json`);

  // Check cache
  try {
    const stat = fs.statSync(cacheFile);
    const ageDays = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);
    if (ageDays < CACHE_TTL_DAYS) {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      return cached;
    }
  } catch {
    // Cache miss or read error - proceed to query
  }

  // Query and cache
  const result = await queryOverpass(lat, lng, radius || 500, spotType);
  if (result) {
    try {
      fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
      fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2), 'utf-8');
    } catch (err) {
      console.warn(`Failed to write cache for ${slug}: ${err.message}`);
    }
  }

  return result;
}
