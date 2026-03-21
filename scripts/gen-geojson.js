#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Ohio bounding box
const LON_MIN = -84.82;
const LON_MAX = -80.52;
const LAT_MIN = 38.40;
const LAT_MAX = 41.98;

const COLS = 10;
const ROWS = 10;

const colWidth = (LON_MAX - LON_MIN) / COLS;
const rowHeight = (LAT_MAX - LAT_MIN) / ROWS;

function makePolygon(col, row) {
  const west = LON_MIN + col * colWidth;
  const east = west + colWidth;
  const north = LAT_MAX - row * rowHeight;
  const south = north - rowHeight;
  const pad = 0.005;
  return [
    [
      [west + pad, south + pad],
      [east - pad, south + pad],
      [east - pad, north - pad],
      [west + pad, north - pad],
      [west + pad, south + pad]
    ]
  ];
}

const counties = [
  { fips: "39171", name: "Williams",   col: 0, row: 0 },
  { fips: "39051", name: "Fulton",     col: 1, row: 0 },
  { fips: "39095", name: "Lucas",      col: 2, row: 0 },
  { fips: "39123", name: "Ottawa",     col: 3, row: 0 },
  { fips: "39043", name: "Erie",       col: 4, row: 0 },
  { fips: "39093", name: "Lorain",     col: 5, row: 0 },
  { fips: "39035", name: "Cuyahoga",   col: 6, row: 0 },
  { fips: "39085", name: "Lake",       col: 7, row: 0 },
  { fips: "39055", name: "Geauga",     col: 8, row: 0 },
  { fips: "39007", name: "Ashtabula",  col: 9, row: 0 },

  { fips: "39039", name: "Defiance",   col: 0, row: 1 },
  { fips: "39069", name: "Henry",      col: 1, row: 1 },
  { fips: "39173", name: "Wood",       col: 2, row: 1 },
  { fips: "39143", name: "Sandusky",   col: 3, row: 1 },
  { fips: "39077", name: "Huron",      col: 4, row: 1 },
  { fips: "39103", name: "Medina",     col: 5, row: 1 },
  { fips: "39153", name: "Summit",     col: 6, row: 1 },
  { fips: "39133", name: "Portage",    col: 7, row: 1 },
  { fips: "39155", name: "Trumbull",   col: 8, row: 1 },
  { fips: "39081", name: "Jefferson",  col: 9, row: 1 },

  { fips: "39125", name: "Paulding",   col: 0, row: 2 },
  { fips: "39137", name: "Putnam",     col: 1, row: 2 },
  { fips: "39063", name: "Hancock",    col: 2, row: 2 },
  { fips: "39147", name: "Seneca",     col: 3, row: 2 },
  { fips: "39033", name: "Crawford",   col: 4, row: 2 },
  { fips: "39005", name: "Ashland",    col: 5, row: 2 },
  { fips: "39169", name: "Wayne",      col: 6, row: 2 },
  { fips: "39151", name: "Stark",      col: 7, row: 2 },
  { fips: "39099", name: "Mahoning",   col: 8, row: 2 },
  { fips: "39029", name: "Columbiana", col: 9, row: 2 },

  { fips: "39161", name: "Van Wert",   col: 0, row: 3 },
  { fips: "39003", name: "Allen",      col: 1, row: 3 },
  { fips: "39065", name: "Hardin",     col: 2, row: 3 },
  { fips: "39175", name: "Wyandot",    col: 3, row: 3 },
  { fips: "39101", name: "Marion",     col: 4, row: 3 },
  { fips: "39083", name: "Knox",       col: 5, row: 3 },
  { fips: "39157", name: "Tuscarawas", col: 6, row: 3 },
  { fips: "39019", name: "Carroll",    col: 7, row: 3 },
  { fips: "39067", name: "Harrison",   col: 8, row: 3 },
  { fips: "39013", name: "Belmont",    col: 9, row: 3 },

  { fips: "39107", name: "Mercer",     col: 0, row: 4 },
  { fips: "39011", name: "Auglaize",   col: 1, row: 4 },
  { fips: "39091", name: "Logan",      col: 2, row: 4 },
  { fips: "39159", name: "Union",      col: 3, row: 4 },
  { fips: "39041", name: "Delaware",   col: 4, row: 4 },
  { fips: "39089", name: "Licking",    col: 5, row: 4 },
  { fips: "39031", name: "Coshocton",  col: 6, row: 4 },
  { fips: "39059", name: "Guernsey",   col: 7, row: 4 },
  { fips: "39075", name: "Holmes",     col: 8, row: 4 },
  { fips: "39029", name: "Columbiana2",col: 9, row: 4 },

  { fips: "39037", name: "Darke",      col: 0, row: 5 },
  { fips: "39149", name: "Shelby",     col: 1, row: 5 },
  { fips: "39021", name: "Champaign",  col: 2, row: 5 },
  { fips: "39097", name: "Madison",    col: 3, row: 5 },
  { fips: "39049", name: "Franklin",   col: 4, row: 5 },
  { fips: "39045", name: "Fairfield",  col: 5, row: 5 },
  { fips: "39127", name: "Perry",      col: 6, row: 5 },
  { fips: "39119", name: "Muskingum",  col: 7, row: 5 },
  { fips: "39121", name: "Noble",      col: 8, row: 5 },
  { fips: "39111", name: "Monroe",     col: 9, row: 5 },

  { fips: "39109", name: "Miami",      col: 0, row: 6 },
  { fips: "39023", name: "Clark",      col: 1, row: 6 },
  { fips: "39057", name: "Greene",     col: 2, row: 6 },
  { fips: "39047", name: "Fayette",    col: 3, row: 6 },
  { fips: "39129", name: "Pickaway",   col: 4, row: 6 },
  { fips: "39073", name: "Hocking",    col: 5, row: 6 },
  { fips: "39115", name: "Morgan",     col: 6, row: 6 },
  { fips: "39167", name: "Washington", col: 7, row: 6 },
  { fips: "39117", name: "Morrow",     col: 8, row: 6 },
  { fips: "39139", name: "Richland",   col: 9, row: 6 },

  { fips: "39135", name: "Preble",     col: 0, row: 7 },
  { fips: "39113", name: "Montgomery", col: 1, row: 7 },
  { fips: "39027", name: "Clinton",    col: 2, row: 7 },
  { fips: "39141", name: "Ross",       col: 3, row: 7 },
  { fips: "39163", name: "Vinton",     col: 4, row: 7 },
  { fips: "39105", name: "Meigs",      col: 5, row: 7 },
  { fips: "39053", name: "Gallia",     col: 6, row: 7 },
  { fips: "39087", name: "Lawrence",   col: 7, row: 7 },
  { fips: "39015", name: "Brown",      col: 8, row: 7 },
  { fips: "39001", name: "Adams",      col: 9, row: 7 },

  { fips: "39017", name: "Butler",     col: 0, row: 8 },
  { fips: "39165", name: "Warren",     col: 1, row: 8 },
  { fips: "39071", name: "Highland",   col: 2, row: 8 },
  { fips: "39131", name: "Pike",       col: 3, row: 8 },
  { fips: "39079", name: "Jackson",    col: 4, row: 8 },
  { fips: "39145", name: "Scioto",     col: 5, row: 8 },
  { fips: "39025", name: "Clermont",   col: 6, row: 8 },

  { fips: "39061", name: "Hamilton",   col: 0, row: 9 },
  { fips: "39043", name: "Erie2",      col: 1, row: 9 },
  { fips: "39077", name: "Huron2",     col: 2, row: 9 },
  { fips: "39033", name: "Crawford2",  col: 3, row: 9 },
  { fips: "39117", name: "Morrow2",    col: 4, row: 9 },
  { fips: "39139", name: "Richland2",  col: 5, row: 9 },
];

// Remove duplicates - use actual unique county list
const uniqueCounties = [
  { fips: "39001", name: "Adams" },
  { fips: "39003", name: "Allen" },
  { fips: "39005", name: "Ashland" },
  { fips: "39007", name: "Ashtabula" },
  { fips: "39009", name: "Athens" },
  { fips: "39011", name: "Auglaize" },
  { fips: "39013", name: "Belmont" },
  { fips: "39015", name: "Brown" },
  { fips: "39017", name: "Butler" },
  { fips: "39019", name: "Carroll" },
  { fips: "39021", name: "Champaign" },
  { fips: "39023", name: "Clark" },
  { fips: "39025", name: "Clermont" },
  { fips: "39027", name: "Clinton" },
  { fips: "39029", name: "Columbiana" },
  { fips: "39031", name: "Coshocton" },
  { fips: "39033", name: "Crawford" },
  { fips: "39035", name: "Cuyahoga" },
  { fips: "39037", name: "Darke" },
  { fips: "39039", name: "Defiance" },
  { fips: "39041", name: "Delaware" },
  { fips: "39043", name: "Erie" },
  { fips: "39045", name: "Fairfield" },
  { fips: "39047", name: "Fayette" },
  { fips: "39049", name: "Franklin" },
  { fips: "39051", name: "Fulton" },
  { fips: "39053", name: "Gallia" },
  { fips: "39055", name: "Geauga" },
  { fips: "39057", name: "Greene" },
  { fips: "39059", name: "Guernsey" },
  { fips: "39061", name: "Hamilton" },
  { fips: "39063", name: "Hancock" },
  { fips: "39065", name: "Hardin" },
  { fips: "39067", name: "Harrison" },
  { fips: "39069", name: "Henry" },
  { fips: "39071", name: "Highland" },
  { fips: "39073", name: "Hocking" },
  { fips: "39075", name: "Holmes" },
  { fips: "39077", name: "Huron" },
  { fips: "39079", name: "Jackson" },
  { fips: "39081", name: "Jefferson" },
  { fips: "39083", name: "Knox" },
  { fips: "39085", name: "Lake" },
  { fips: "39087", name: "Lawrence" },
  { fips: "39089", name: "Licking" },
  { fips: "39091", name: "Logan" },
  { fips: "39093", name: "Lorain" },
  { fips: "39095", name: "Lucas" },
  { fips: "39097", name: "Madison" },
  { fips: "39099", name: "Mahoning" },
  { fips: "39101", name: "Marion" },
  { fips: "39103", name: "Medina" },
  { fips: "39105", name: "Meigs" },
  { fips: "39107", name: "Mercer" },
  { fips: "39109", name: "Miami" },
  { fips: "39111", name: "Monroe" },
  { fips: "39113", name: "Montgomery" },
  { fips: "39115", name: "Morgan" },
  { fips: "39117", name: "Morrow" },
  { fips: "39119", name: "Muskingum" },
  { fips: "39121", name: "Noble" },
  { fips: "39123", name: "Ottawa" },
  { fips: "39125", name: "Paulding" },
  { fips: "39127", name: "Perry" },
  { fips: "39129", name: "Pickaway" },
  { fips: "39131", name: "Pike" },
  { fips: "39133", name: "Portage" },
  { fips: "39135", name: "Preble" },
  { fips: "39137", name: "Putnam" },
  { fips: "39139", name: "Richland" },
  { fips: "39141", name: "Ross" },
  { fips: "39143", name: "Sandusky" },
  { fips: "39145", name: "Scioto" },
  { fips: "39147", name: "Seneca" },
  { fips: "39149", name: "Shelby" },
  { fips: "39151", name: "Stark" },
  { fips: "39153", name: "Summit" },
  { fips: "39155", name: "Trumbull" },
  { fips: "39157", name: "Tuscarawas" },
  { fips: "39159", name: "Union" },
  { fips: "39161", name: "Van Wert" },
  { fips: "39163", name: "Vinton" },
  { fips: "39165", name: "Warren" },
  { fips: "39167", name: "Washington" },
  { fips: "39169", name: "Wayne" },
  { fips: "39171", name: "Williams" },
  { fips: "39173", name: "Wood" },
  { fips: "39175", name: "Wyandot" },
];

// Grid positions for each county (col, row) in a 10x9 grid
const positions = {
  "39171": [0, 0], "39051": [1, 0], "39095": [2, 0], "39123": [3, 0], "39043": [4, 0],
  "39093": [5, 0], "39035": [6, 0], "39085": [7, 0], "39055": [8, 0], "39007": [9, 0],

  "39039": [0, 1], "39069": [1, 1], "39173": [2, 1], "39143": [3, 1], "39077": [4, 1],
  "39103": [5, 1], "39153": [6, 1], "39133": [7, 1], "39155": [8, 1], "39081": [9, 1],

  "39125": [0, 2], "39137": [1, 2], "39063": [2, 2], "39147": [3, 2], "39033": [4, 2],
  "39005": [5, 2], "39169": [6, 2], "39151": [7, 2], "39099": [8, 2], "39029": [9, 2],

  "39161": [0, 3], "39003": [1, 3], "39065": [2, 3], "39175": [3, 3], "39101": [4, 3],
  "39083": [5, 3], "39157": [6, 3], "39019": [7, 3], "39067": [8, 3], "39013": [9, 3],

  "39107": [0, 4], "39011": [1, 4], "39091": [2, 4], "39159": [3, 4], "39041": [4, 4],
  "39089": [5, 4], "39031": [6, 4], "39059": [7, 4], "39075": [8, 4], "39029b": [9, 4],

  "39037": [0, 5], "39149": [1, 5], "39021": [2, 5], "39097": [3, 5], "39049": [4, 5],
  "39045": [5, 5], "39127": [6, 5], "39119": [7, 5], "39121": [8, 5], "39111": [9, 5],

  "39109": [0, 6], "39023": [1, 6], "39057": [2, 6], "39047": [3, 6], "39129": [4, 6],
  "39073": [5, 6], "39115": [6, 6], "39167": [7, 6], "39117": [8, 6], "39139": [9, 6],

  "39135": [0, 7], "39113": [1, 7], "39027": [2, 7], "39141": [3, 7], "39163": [4, 7],
  "39105": [5, 7], "39053": [6, 7], "39087": [7, 7], "39015": [8, 7], "39001": [9, 7],

  "39017": [0, 8], "39165": [1, 8], "39071": [2, 8], "39131": [3, 8], "39079": [4, 8],
  "39145": [5, 8], "39025": [6, 8], "39009": [7, 8], "39061": [8, 8], "39043b": [9, 8],
};

// Only use valid unique fips
const validFips = new Set(uniqueCounties.map(c => c.fips));

// Build features using a simpler index-based grid
// 88 counties in 10x9 = 90 cells, 2 empty
const gridLayout = [
  // row 0 (north): 10 counties
  ["39171","39051","39095","39123","39043","39093","39035","39085","39055","39007"],
  // row 1: 9 counties + pad
  ["39039","39069","39173","39143","39077","39103","39153","39133","39155","39081"],
  // row 2: 10 counties
  ["39125","39137","39063","39147","39033","39005","39169","39151","39099","39029"],
  // row 3: 9 counties + pad
  ["39161","39003","39065","39175","39101","39083","39157","39019","39067","39013"],
  // row 4: 9+1
  ["39107","39011","39091","39159","39041","39089","39031","39059","39075","39029"],
  // row 5: 10
  ["39037","39149","39021","39097","39049","39045","39127","39119","39121","39111"],
  // row 6: 10
  ["39109","39023","39057","39047","39129","39073","39115","39167","39117","39139"],
  // row 7: 10
  ["39135","39113","39027","39141","39163","39105","39053","39087","39015","39001"],
  // row 8: 8 + 2 blanks
  ["39017","39165","39071","39131","39079","39145","39025","39009","39061",""],
];

// Deduplicate - track which fips have been placed
const placed = new Set();
const features = [];

gridLayout.forEach((row, rowIdx) => {
  row.forEach((fips, colIdx) => {
    if (!fips || placed.has(fips)) return;
    const county = uniqueCounties.find(c => c.fips === fips);
    if (!county) return;
    placed.add(fips);
    features.push({
      type: "Feature",
      properties: { FIPS: fips, NAME: county.name },
      geometry: { type: "Polygon", coordinates: makePolygon(colIdx, rowIdx) }
    });
  });
});

// Add any missing counties
uniqueCounties.forEach((c, i) => {
  if (!placed.has(c.fips)) {
    // Place in overflow area
    const col = i % 10;
    const row = 9 + Math.floor(i / 10);
    features.push({
      type: "Feature",
      properties: { FIPS: c.fips, NAME: c.name },
      geometry: { type: "Polygon", coordinates: makePolygon(col, row) }
    });
    console.log(`Overflow: ${c.name} (${c.fips})`);
  }
});

const geojson = { type: "FeatureCollection", features };
const outPath = path.join(__dirname, '../public/ohio-counties.geojson');
fs.writeFileSync(outPath, JSON.stringify(geojson));
console.log(`Written ${features.length} county features`);
