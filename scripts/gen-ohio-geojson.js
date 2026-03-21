#!/usr/bin/env node
/**
 * Generates a GeoJSON FeatureCollection for all 88 Ohio counties.
 * Each county is an approximate polygon based on its geographic center.
 */

const fs = require("fs");
const path = require("path");

// All 88 Ohio counties: [FIPS, Name, centerLng, centerLat]
const counties = [
  // Row 1 (lat ~41.7)
  ["39171", "Williams",    -84.60, 41.70],
  ["39051", "Fulton",      -84.10, 41.70],
  ["39095", "Lucas",       -83.60, 41.70],
  ["39123", "Ottawa",      -83.10, 41.70],
  ["39043", "Erie",        -82.60, 41.70],
  ["39093", "Lorain",      -82.10, 41.70],
  ["39035", "Cuyahoga",    -81.70, 41.70],
  ["39085", "Lake",        -81.30, 41.70],
  ["39055", "Geauga",      -81.10, 41.70],
  ["39007", "Ashtabula",   -80.70, 41.70],

  // Row 2 (lat ~41.3)
  ["39039", "Defiance",    -84.40, 41.30],
  ["39069", "Henry",       -84.00, 41.30],
  ["39173", "Wood",        -83.60, 41.30],
  ["39143", "Sandusky",    -83.10, 41.30],
  ["39077", "Huron",       -82.60, 41.30],
  ["39103", "Medina",      -81.90, 41.30],
  ["39153", "Summit",      -81.50, 41.30],
  ["39133", "Portage",     -81.20, 41.30],
  ["39155", "Trumbull",    -80.80, 41.30],
  ["39099", "Mahoning",    -80.60, 41.30],

  // Row 3 (lat ~40.9)
  ["39125", "Paulding",    -84.60, 40.90],
  ["39137", "Putnam",      -84.10, 40.90],
  ["39063", "Hancock",     -83.60, 40.90],
  ["39147", "Seneca",      -83.10, 40.90],
  ["39033", "Crawford",    -82.90, 40.90],
  ["39139", "Richland",    -82.50, 40.90],
  ["39005", "Ashland",     -82.20, 40.90],
  ["39169", "Wayne",       -81.90, 40.90],
  ["39151", "Stark",       -81.40, 40.90],
  ["39029", "Columbiana",  -80.70, 40.90],

  // Row 4 (lat ~40.6)
  ["39161", "Van Wert",    -84.60, 40.60],
  ["39003", "Allen",       -84.10, 40.60],
  ["39065", "Hardin",      -83.70, 40.60],
  ["39175", "Wyandot",     -83.30, 40.60],
  ["39101", "Marion",      -83.00, 40.60],
  ["39117", "Morrow",      -82.70, 40.60],
  ["39083", "Knox",        -82.40, 40.60],
  ["39075", "Holmes",      -81.90, 40.60],
  ["39157", "Tuscarawas",  -81.40, 40.60],
  ["39019", "Carroll",     -81.10, 40.60],
  ["39081", "Jefferson",   -80.70, 40.60],
  ["39067", "Harrison",    -81.10, 40.30],

  // Row 5 (lat ~40.3)
  ["39107", "Mercer",      -84.60, 40.30],
  ["39011", "Auglaize",    -84.20, 40.30],
  ["39091", "Logan",       -83.80, 40.30],
  ["39159", "Union",       -83.40, 40.30],
  ["39041", "Delaware",    -83.00, 40.30],
  ["39089", "Licking",     -82.50, 40.30],
  ["39031", "Coshocton",   -81.90, 40.30],
  ["39059", "Guernsey",    -81.50, 40.30],
  ["39013", "Belmont",     -80.80, 40.30],
  ["39111", "Monroe",      -81.10, 39.70],

  // Row 6 (lat ~40.0)
  ["39037", "Darke",       -84.60, 40.00],
  ["39149", "Shelby",      -84.20, 40.00],
  ["39021", "Champaign",   -83.80, 40.00],
  ["39097", "Madison",     -83.40, 40.00],
  ["39049", "Franklin",    -83.00, 40.00],
  ["39045", "Fairfield",   -82.60, 40.00],
  ["39127", "Perry",       -82.20, 40.00],
  ["39119", "Muskingum",   -81.90, 40.00],
  ["39121", "Noble",       -81.50, 40.00],
  ["39115", "Morgan",      -81.80, 39.60],

  // Row 7 (lat ~39.7)
  ["39135", "Preble",      -84.70, 39.70],
  ["39113", "Montgomery",  -84.20, 39.70],
  ["39109", "Miami",       -84.20, 40.10],
  ["39023", "Clark",       -83.80, 39.70],
  ["39057", "Greene",      -83.90, 39.70],
  ["39047", "Fayette",     -83.50, 39.70],
  ["39129", "Pickaway",    -83.00, 39.70],
  ["39073", "Hocking",     -82.50, 39.70],
  ["39163", "Vinton",      -82.30, 39.70],
  ["39009", "Athens",      -82.00, 39.70],
  ["39167", "Washington",  -81.50, 39.70],
  ["39105", "Meigs",       -82.00, 39.10],

  // Row 8 (lat ~39.4)
  ["39017", "Butler",      -84.60, 39.40],
  ["39165", "Warren",      -84.20, 39.40],
  ["39027", "Clinton",     -83.80, 39.40],
  ["39071", "Highland",    -83.50, 39.40],
  ["39141", "Ross",        -83.00, 39.40],
  ["39131", "Pike",        -83.00, 39.10],
  ["39079", "Jackson",     -82.60, 39.40],
  ["39053", "Gallia",      -82.20, 39.40],
  ["39087", "Lawrence",    -82.50, 38.60],

  // Row 9 (lat ~39.1)
  ["39061", "Hamilton",    -84.50, 39.10],
  ["39025", "Clermont",    -84.10, 39.10],
  ["39015", "Brown",       -83.90, 39.10],
  ["39001", "Adams",       -83.50, 39.10],
  ["39145", "Scioto",      -82.90, 39.10],
];

// Default polygon half-widths
const defaultHalfW = 0.225;
const defaultHalfH = 0.175;

// Slight per-vertex jitter to avoid perfect rectangles
// Returns a small random-ish offset based on a seed
function jitter(seed) {
  // Deterministic pseudo-random based on seed
  const x = Math.sin(seed * 9.8765 + 3.456) * 43758.5453;
  return ((x - Math.floor(x)) - 0.5) * 0.04; // range ~ -0.02 to +0.02
}

function makePolygon(lng, lat, halfW, halfH, seed) {
  // Create a 5-6 point polygon (rectangle with slight vertex jitter)
  const j = (i) => jitter(seed + i);

  // Go clockwise: SW -> SE -> NE -> NW -> SW (closed ring)
  const coords = [
    [lng - halfW + j(0), lat - halfH + j(1)],  // SW
    [lng + halfW + j(2), lat - halfH + j(3)],  // SE
    [lng + halfW + j(4), lat + halfH + j(5)],  // NE
    [lng - halfW + j(6), lat + halfH + j(7)],  // NW
  ];
  // Close the ring
  coords.push([coords[0][0], coords[0][1]]);

  // Round to 4 decimal places
  return [coords.map(c => [Math.round(c[0] * 10000) / 10000, Math.round(c[1] * 10000) / 10000])];
}

const features = counties.map(([fips, name, lng, lat], idx) => ({
  type: "Feature",
  properties: {
    FIPS: fips,
    NAME: name,
  },
  geometry: {
    type: "Polygon",
    coordinates: makePolygon(lng, lat, defaultHalfW, defaultHalfH, idx * 10 + 1),
  },
}));

const geojson = {
  type: "FeatureCollection",
  features,
};

// Validate count
const names = features.map(f => f.properties.NAME);
const uniqueNames = new Set(names);
console.log(`Generated ${features.length} county features (${uniqueNames.size} unique names)`);

if (features.length !== 88) {
  console.error(`ERROR: Expected 88 counties, got ${features.length}`);
  process.exit(1);
}

// Check for duplicate FIPS
const fipsCodes = features.map(f => f.properties.FIPS);
const uniqueFips = new Set(fipsCodes);
if (uniqueFips.size !== 88) {
  console.error(`ERROR: Found duplicate FIPS codes`);
  process.exit(1);
}

const outPath = path.join(__dirname, "..", "public", "ohio-counties.geojson");
fs.writeFileSync(outPath, JSON.stringify(geojson, null, 2), "utf-8");
console.log(`Wrote ${outPath}`);

// Validate JSON
try {
  JSON.parse(fs.readFileSync(outPath, "utf-8"));
  console.log("JSON validation: OK");
} catch (e) {
  console.error("JSON validation FAILED:", e.message);
  process.exit(1);
}
