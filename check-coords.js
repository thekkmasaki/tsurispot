const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src/lib/data');
const allFiles = fs.readdirSync(dataDir).filter(f => f.startsWith('spots') && f.endsWith('.ts'));

const results = [];

for (const file of allFiles) {
  const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');

  // Find latitude/longitude pairs with context (name, address)
  // Strategy: find each latitude occurrence and look for nearby name and address
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const latMatch = lines[i].match(/latitude:\s*([\d.]+)/);
    if (!latMatch) continue;

    const lat = parseFloat(latMatch[1]);

    // Find longitude on same line or next line
    let lng = null;
    const lngSameLine = lines[i].match(/longitude:\s*([\d.]+)/);
    if (lngSameLine) {
      lng = parseFloat(lngSameLine[1]);
    } else if (i + 1 < lines.length) {
      const lngNextLine = lines[i + 1].match(/longitude:\s*([\d.]+)/);
      if (lngNextLine) lng = parseFloat(lngNextLine[1]);
    }
    if (lng === null) continue;

    // Search backward for name, id, address (within 20 lines)
    let name = '', id = '', address = '', slug = '';
    for (let j = i; j >= Math.max(0, i - 20); j--) {
      if (!name) {
        const nm = lines[j].match(/name:\s*"([^"]*)"/);
        if (nm) name = nm[1];
      }
      if (!id) {
        const idm = lines[j].match(/id:\s*"([^"]*)"/);
        if (idm) id = idm[1];
      }
      if (!slug) {
        const sm = lines[j].match(/slug:\s*"([^"]*)"/);
        if (sm) slug = sm[1];
      }
    }

    // Search forward for address (within 5 lines)
    for (let j = i; j <= Math.min(lines.length - 1, i + 5); j++) {
      const addrMatch = lines[j].match(/address:\s*"([^"]*)"/);
      if (addrMatch) { address = addrMatch[1]; break; }
    }
    // Also search backward if not found
    if (!address) {
      for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
        const addrMatch = lines[j].match(/address:\s*"([^"]*)"/);
        if (addrMatch) { address = addrMatch[1]; break; }
      }
    }

    results.push({ file, id, name, slug, lat, lng, address, line: i + 1 });
  }
}

console.log('Total spots found:', results.length);

// Prefecture coordinate ranges (generous)
const prefRanges = {
  '北海道': { latMin: 41, latMax: 45.6, lngMin: 139, lngMax: 146 },
  '青森': { latMin: 40.2, latMax: 41.6, lngMin: 139.4, lngMax: 141.7 },
  '岩手': { latMin: 38.7, latMax: 40.5, lngMin: 140.6, lngMax: 142.1 },
  '宮城': { latMin: 37.7, latMax: 39.0, lngMin: 140.2, lngMax: 141.7 },
  '秋田': { latMin: 39.0, latMax: 40.5, lngMin: 139.5, lngMax: 140.7 },
  '山形': { latMin: 37.7, latMax: 39.2, lngMin: 139.5, lngMax: 140.6 },
  '福島': { latMin: 36.8, latMax: 38.0, lngMin: 139.1, lngMax: 141.1 },
  '茨城': { latMin: 35.7, latMax: 36.9, lngMin: 139.7, lngMax: 140.9 },
  '栃木': { latMin: 36.2, latMax: 37.2, lngMin: 139.3, lngMax: 140.3 },
  '群馬': { latMin: 36.0, latMax: 37.0, lngMin: 138.5, lngMax: 139.7 },
  '埼玉': { latMin: 35.7, latMax: 36.3, lngMin: 138.7, lngMax: 139.9 },
  '千葉': { latMin: 34.9, latMax: 36.0, lngMin: 139.7, lngMax: 140.9 },
  '東京': { latMin: 20.4, latMax: 35.9, lngMin: 136.0, lngMax: 140.2 },
  '神奈川': { latMin: 35.1, latMax: 35.7, lngMin: 138.9, lngMax: 139.8 },
  '新潟': { latMin: 36.7, latMax: 38.6, lngMin: 137.8, lngMax: 140.0 },
  '富山': { latMin: 36.3, latMax: 36.9, lngMin: 136.7, lngMax: 137.8 },
  '石川': { latMin: 36.0, latMax: 37.9, lngMin: 136.2, lngMax: 137.4 },
  '福井': { latMin: 35.4, latMax: 36.3, lngMin: 135.5, lngMax: 136.9 },
  '山梨': { latMin: 35.2, latMax: 35.9, lngMin: 138.2, lngMax: 139.1 },
  '長野': { latMin: 35.2, latMax: 37.0, lngMin: 137.5, lngMax: 138.8 },
  '岐阜': { latMin: 35.1, latMax: 36.5, lngMin: 136.3, lngMax: 137.7 },
  '静岡': { latMin: 34.5, latMax: 35.7, lngMin: 137.5, lngMax: 139.2 },
  '愛知': { latMin: 34.5, latMax: 35.5, lngMin: 136.7, lngMax: 137.8 },
  '三重': { latMin: 33.7, latMax: 35.2, lngMin: 135.8, lngMax: 137.0 },
  '滋賀': { latMin: 34.8, latMax: 35.7, lngMin: 135.8, lngMax: 136.5 },
  '京都': { latMin: 34.8, latMax: 35.8, lngMin: 134.8, lngMax: 136.1 },
  '大阪': { latMin: 34.2, latMax: 35.0, lngMin: 135.0, lngMax: 135.8 },
  '兵庫': { latMin: 34.2, latMax: 35.7, lngMin: 134.2, lngMax: 135.5 },
  '奈良': { latMin: 33.8, latMax: 34.8, lngMin: 135.5, lngMax: 136.3 },
  '和歌山': { latMin: 33.4, latMax: 34.4, lngMin: 135.0, lngMax: 136.0 },
  '鳥取': { latMin: 35.0, latMax: 35.7, lngMin: 133.2, lngMax: 134.5 },
  '島根': { latMin: 34.0, latMax: 36.3, lngMin: 131.6, lngMax: 133.4 },
  '岡山': { latMin: 34.4, latMax: 35.3, lngMin: 133.3, lngMax: 134.4 },
  '広島': { latMin: 34.0, latMax: 35.0, lngMin: 132.0, lngMax: 133.4 },
  '山口': { latMin: 33.7, latMax: 34.8, lngMin: 130.8, lngMax: 132.2 },
  '徳島': { latMin: 33.5, latMax: 34.3, lngMin: 133.5, lngMax: 134.9 },
  '香川': { latMin: 34.0, latMax: 34.6, lngMin: 133.4, lngMax: 134.5 },
  '愛媛': { latMin: 32.9, latMax: 34.2, lngMin: 132.0, lngMax: 133.7 },
  '高知': { latMin: 32.7, latMax: 33.9, lngMin: 132.4, lngMax: 134.3 },
  '福岡': { latMin: 33.0, latMax: 34.0, lngMin: 130.0, lngMax: 131.2 },
  '佐賀': { latMin: 33.0, latMax: 33.6, lngMin: 129.7, lngMax: 130.6 },
  '長崎': { latMin: 32.0, latMax: 34.7, lngMin: 128.5, lngMax: 130.4 },
  '熊本': { latMin: 32.0, latMax: 33.3, lngMin: 129.9, lngMax: 131.4 },
  '大分': { latMin: 32.7, latMax: 33.8, lngMin: 130.8, lngMax: 132.1 },
  '宮崎': { latMin: 31.3, latMax: 32.9, lngMin: 130.7, lngMax: 131.9 },
  '鹿児島': { latMin: 27.0, latMax: 32.3, lngMin: 128.5, lngMax: 131.3 },
  '沖縄': { latMin: 24.0, latMax: 27.9, lngMin: 122.9, lngMax: 131.4 },
};

const issues = [];

for (const spot of results) {
  // Basic Japan range check
  if (spot.lat < 20 || spot.lat > 46 || spot.lng < 122 || spot.lng > 155) {
    issues.push({ type: 'OUT_OF_JAPAN', ...spot });
    continue;
  }

  // Extract prefecture from address
  const prefMatch = spot.address.match(/^(北海道|東京都|大阪府|京都府|.{2,3}県)/);
  if (prefMatch) {
    const pref = prefMatch[1].replace(/都|府|県/, '');
    const range = prefRanges[pref];
    if (range) {
      if (spot.lat < range.latMin - 0.5 || spot.lat > range.latMax + 0.5 ||
          spot.lng < range.lngMin - 0.5 || spot.lng > range.lngMax + 0.5) {
        issues.push({
          type: 'PREF_MISMATCH',
          pref,
          expectedLat: `${range.latMin}-${range.latMax}`,
          expectedLng: `${range.lngMin}-${range.lngMax}`,
          ...spot
        });
      }
    }
  }

  // Check precision
  const latStr = String(spot.lat);
  const lngStr = String(spot.lng);
  const latDecimals = latStr.includes('.') ? latStr.split('.')[1].length : 0;
  const lngDecimals = lngStr.includes('.') ? lngStr.split('.')[1].length : 0;
  if (latDecimals < 3 || lngDecimals < 3) {
    issues.push({ type: 'LOW_PRECISION', latDecimals, lngDecimals, ...spot });
  }
}

// Duplicates
const coordMap = {};
for (const spot of results) {
  const key = `${spot.lat},${spot.lng}`;
  if (!coordMap[key]) coordMap[key] = [];
  coordMap[key].push(spot);
}
for (const [key, spots] of Object.entries(coordMap)) {
  if (spots.length > 1) {
    issues.push({
      type: 'DUPLICATE_COORDS',
      coords: key,
      spots: spots.map(s => `${s.name} (${s.id}, ${s.file}:${s.line})`).join(' | ')
    });
  }
}

console.log('\n=== ISSUES FOUND ===');
console.log('Total issues:', issues.length);
for (const issue of issues) {
  if (issue.type === 'DUPLICATE_COORDS') {
    console.log(`[${issue.type}] ${issue.coords}: ${issue.spots}`);
  } else {
    console.log(`[${issue.type}] ${issue.name} (${issue.id}) in ${issue.file}:${issue.line}: lat=${issue.lat}, lng=${issue.lng}, addr=${issue.address}${issue.pref ? ', pref=' + issue.pref : ''}${issue.expectedLat ? ', expected lat=' + issue.expectedLat + ' lng=' + issue.expectedLng : ''}`);
  }
}

// Output all spots for review
console.log('\n=== ALL SPOTS ===');
for (const s of results) {
  console.log(`${s.file}:${s.line} | ${s.id} | ${s.name} | lat=${s.lat} lng=${s.lng} | ${s.address}`);
}
