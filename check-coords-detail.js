// Detailed coordinate check - verify specific spots where coordinates might be wrong
// Focus on: spots with very round numbers, potential copy-paste errors, spots that may have
// been placed at city centers instead of actual fishing locations

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src/lib/data');
const allFiles = fs.readdirSync(dataDir).filter(f => f.startsWith('spots') && f.endsWith('.ts'));

const results = [];

for (const file of allFiles) {
  const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const latMatch = lines[i].match(/latitude:\s*([\d.]+)/);
    if (!latMatch) continue;
    const lat = parseFloat(latMatch[1]);
    let lng = null;
    const lngSameLine = lines[i].match(/longitude:\s*([\d.]+)/);
    if (lngSameLine) {
      lng = parseFloat(lngSameLine[1]);
    } else if (i + 1 < lines.length) {
      const lngNextLine = lines[i + 1].match(/longitude:\s*([\d.]+)/);
      if (lngNextLine) lng = parseFloat(lngNextLine[1]);
    }
    if (lng === null) continue;

    let name = '', id = '', address = '', slug = '';
    for (let j = i; j >= Math.max(0, i - 20); j--) {
      if (!name) { const nm = lines[j].match(/name:\s*"([^"]*)"/); if (nm) name = nm[1]; }
      if (!id) { const idm = lines[j].match(/id:\s*"([^"]*)"/); if (idm) id = idm[1]; }
      if (!slug) { const sm = lines[j].match(/slug:\s*"([^"]*)"/); if (sm) slug = sm[1]; }
    }
    for (let j = i; j <= Math.min(lines.length - 1, i + 5); j++) {
      const addrMatch = lines[j].match(/address:\s*"([^"]*)"/);
      if (addrMatch) { address = addrMatch[1]; break; }
    }
    if (!address) {
      for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
        const addrMatch = lines[j].match(/address:\s*"([^"]*)"/);
        if (addrMatch) { address = addrMatch[1]; break; }
      }
    }
    results.push({ file, id, name, slug, lat, lng, address, line: i + 1 });
  }
}

// Known correct coordinates for Japanese fishing spots (reference data)
// These are well-known locations where we can verify coordinates
const knownLocations = {
  '小樽港': { lat: 43.1907, lng: 140.9946, note: 'Otaru Port' },
  '石狩湾新港': { lat: 43.2170, lng: 141.3030, note: 'Ishikari Bay New Port' },
  '函館港': { lat: 41.7686, lng: 140.7264, note: 'Hakodate Port' },
  '釧路港': { lat: 42.9756, lng: 144.3819, note: 'Kushiro Port' },
  '大黒海釣り施設': { lat: 35.4628, lng: 139.6678, note: 'Daikoku Fishing Facility' },
  '若洲海浜公園': { lat: 35.6178, lng: 139.8278, note: 'Wakasu Seaside Park' },
  '熱海港海釣り施設': { lat: 35.0944, lng: 139.0756, note: 'Atami Port' },
};

// Check for specific problematic patterns:
// 1. Spots where lat/lng might be swapped
// 2. Spots with coordinates that are way off for their prefecture
// 3. Adjacent spots in a file with nearly identical coordinates

console.log('=== DETAILED COORDINATE VERIFICATION ===');
console.log('Total spots:', results.length);

// Check for potential lat/lng swap (lat should be 24-46, lng should be 122-154)
const swapped = results.filter(s => s.lat > 100 || s.lng < 100);
if (swapped.length > 0) {
  console.log('\n--- POSSIBLE LAT/LNG SWAP ---');
  swapped.forEach(s => console.log(`  ${s.name} (${s.id}): lat=${s.lat} lng=${s.lng}`));
}

// Check spots that are very close together (within 0.001 degrees = ~100m) but in different files
// Could indicate copy-paste issues
console.log('\n--- VERY CLOSE SPOTS (different files) ---');
for (let i = 0; i < results.length; i++) {
  for (let j = i + 1; j < results.length; j++) {
    if (results[i].file === results[j].file) continue;
    const dLat = Math.abs(results[i].lat - results[j].lat);
    const dLng = Math.abs(results[i].lng - results[j].lng);
    if (dLat < 0.005 && dLng < 0.005 && !(dLat === 0 && dLng === 0)) {
      console.log(`  ${results[i].name} (${results[i].id}, ${results[i].file}) lat=${results[i].lat} lng=${results[i].lng}`);
      console.log(`  ${results[j].name} (${results[j].id}, ${results[j].file}) lat=${results[j].lat} lng=${results[j].lng}`);
      console.log('');
    }
  }
}

// Check for spots in same file that are suspiciously far from their neighbors
// (could indicate coordinate errors)
console.log('\n--- PER-FILE OUTLIER CHECK ---');
for (const file of allFiles) {
  const fileSpots = results.filter(s => s.file === file);
  if (fileSpots.length < 3) continue;

  // Group by approximate region (prefecture from address)
  const prefGroups = {};
  for (const s of fileSpots) {
    const pm = s.address.match(/^(北海道|東京都|大阪府|京都府|.{2,3}県)/);
    const pref = pm ? pm[1] : 'unknown';
    if (!prefGroups[pref]) prefGroups[pref] = [];
    prefGroups[pref].push(s);
  }

  for (const [pref, spots] of Object.entries(prefGroups)) {
    if (spots.length < 2) continue;
    const avgLat = spots.reduce((s, x) => s + x.lat, 0) / spots.length;
    const avgLng = spots.reduce((s, x) => s + x.lng, 0) / spots.length;

    for (const s of spots) {
      const dist = Math.sqrt(Math.pow(s.lat - avgLat, 2) + Math.pow(s.lng - avgLng, 2));
      if (dist > 1.5) { // More than ~150km from prefecture average
        console.log(`  OUTLIER in ${file}: ${s.name} (${s.id}) lat=${s.lat} lng=${s.lng} addr=${s.address} (${dist.toFixed(2)} deg from ${pref} avg)`);
      }
    }
  }
}

// Specific spot-by-spot verification for well-known fishing spots
console.log('\n--- SPECIFIC SPOT CHECKS ---');

// Check Okinawa spots - should all be lat 24-28
const okinawaSpots = results.filter(s => s.address.includes('沖縄'));
for (const s of okinawaSpots) {
  if (s.lat < 24 || s.lat > 28) {
    console.log(`  WRONG: ${s.name} lat=${s.lat} lng=${s.lng} (Okinawa should be 24-28)`);
  }
}

// Check Hokkaido spots - should all be lat 41-46
const hokkaidoSpots = results.filter(s => s.address.includes('北海道'));
for (const s of hokkaidoSpots) {
  if (s.lat < 41 || s.lat > 46) {
    console.log(`  WRONG: ${s.name} lat=${s.lat} lng=${s.lng} (Hokkaido should be 41-46)`);
  }
}

// Check spots with very round coordinates (possible city-center placement)
console.log('\n--- VERY ROUND COORDINATES (possible city-center) ---');
for (const s of results) {
  const latStr = String(s.lat);
  const lngStr = String(s.lng);
  const latDec = latStr.includes('.') ? latStr.split('.')[1] : '';
  const lngDec = lngStr.includes('.') ? lngStr.split('.')[1] : '';
  // Check if coordinates end in 0 or 5 (very round)
  if ((latDec.length <= 2 || lngDec.length <= 2) && latDec.length > 0 && lngDec.length > 0) {
    // Only flag if both are very round
    if (latDec.length <= 2 && lngDec.length <= 2) {
      console.log(`  ${s.name} (${s.id}): lat=${s.lat} lng=${s.lng} in ${s.file}:${s.line}`);
    }
  }
}
