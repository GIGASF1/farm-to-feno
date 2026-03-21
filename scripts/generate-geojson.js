#!/usr/bin/env node
// Generates a simplified Ohio county GeoJSON for the map
// Each county is represented as an approximate rectangular polygon

// Ohio bounding box: -84.82 to -80.52 lon, 38.40 to 41.98 lat
// Grid approach: roughly 10 columns x 11 rows

const counties = [
  // Row 1 (northernmost): 10 counties
  { fips: "39171", name: "Williams",   col: 0,  row: 0 },
  { fips: "39051", name: "Fulton",     col: 1,  row: 0 },
  { fips: "39095", name: "Lucas",      col: 2,  row: 0 },
  { fips: "39123", name: "Ottawa",     col: 3,  row: 0 },
  { fips: "39043", name: "Erie",       col: 4,  row: 0 },
  { fips: "39093", name: "Lorain",     col: 5,  row: 0 },
  { fips: "39035", name: "Cuyahoga",   col: 6,  row: 0 },
  { fips: "39085", name: "Lake",       col: 7,  row: 0 },
  { fips: "39055", name: "Geauga",     col: 8,  row: 0 },
  { fips: "39007", name: "Ashtabula",  col: 9,  row: 0 },

  // Row 2: 9 counties
  { fips: "39039", name: "Defiance",   col: 0,  row: 1 },
  { fips: "39069", name: "Henry",      col: 1,  row: 1 },
  { fips: "39173", name: "Wood",       col: 2,  row: 1 },
  { fips: "39143", name: "Sandusky",   col: 3,  row: 1 },
  { fips: "39077", name: "Huron",      col: 4,  row: 1 },
  { fips: "39103", name: "Medina",     col: 5,  row: 1 },
  { fips: "39153", name: "Summit",     col: 6,  row: 1 },
  { fips: "39133", name: "Portage",    col: 7,  row: 1 },
  { fips: "39155", name: "Trumbull",   col: 8,  row: 1 },

  // Row 3: 10 counties
  { fips: "39125", name: "Paulding",   col: 0,  row: 2 },
  { fips: "39137", name: "Putnam",     col: 1,  row: 2 },
  { fips: "39063", name: "Hancock",    col: 2,  row: 2 },
  { fips: "39147", name: "Seneca",     col: 3,  row: 2 },
  { fips: "39033", name: "Crawford",   col: 4,  row: 2 },
  { fips: "39005", name: "Ashland",    col: 5,  row: 2 },
  { fips: "39169", name: "Wayne",      col: 6,  row: 2 },
  { fips: "39151", name: "Stark",      col: 7,  row: 2 },
  { fips: "39099", name: "Mahoning",   col: 8,  row: 2 },
  { fips: "39029", name: "Columbiana", col: 9,  row: 2 },

  // Row 4: 9 counties
  { fips: "39161", name: "Van Wert",   col: 0,  row: 3 },
  { fips: "39003", name: "Allen",      col: 1,  row: 3 },
  { fips: "39065", name: "Hardin",     col: 2,  row: 3 },
  { fips: "39175", name: "Wyandot",    col: 3,  row: 3 },
  { fips: "39101", name: "Marion",     col: 4,  row: 3 },
  { fips: "39083", name: "Knox",       col: 5,  row: 3 },
  { fips: "39157", name: "Tuscarawas", col: 6,  row: 3 },
  { fips: "39019", name: "Carroll",    col: 7,  row: 3 },
  { fips: "39081", name: "Jefferson",  col: 8,  row: 3 },

  // Row 5: 10 counties
  { fips: "39107", name: "Mercer",     col: 0,  row: 4 },
  { fips: "39011", name: "Auglaize",   col: 1,  row: 4 },
  { fips: "39091", name: "Logan",      col: 2,  row: 4 },
  { fips: "39159", name: "Union",      col: 3,  row: 4 },
  { fips: "39041", name: "Delaware",   col: 4,  row: 4 },
  { fips: "39089", name: "Licking",    col: 5,  row: 4 },
  { fips: "39031", name: "Coshocton",  col: 6,  row: 4 },
  { fips: "39059", name: "Guernsey",   col: 7,  row: 4 },
  { fips: "39067", name: "Harrison",   col: 8,  row: 4 },
  { fips: "39013", name: "Belmont",    col: 9,  row: 4 },

  // Row 6: 10 counties
  { fips: "39037", name: "Darke",      col: 0,  row: 5 },
  { fips: "39149", name: "Shelby",     col: 1,  row: 5 },
  { fips: "39021", name: "Champaign",  col: 2,  row: 5 },
  { fips: "39097", name: "Madison",    col: 3,  row: 5 },
  { fips: "39049", name: "Franklin",   col: 4,  row: 5 },
  { fips: "39045", name: "Fairfield",  col: 5,  row: 5 },
  { fips: "39127", name: "Perry",      col: 6,  row: 5 },
  { fips: "39119", name: "Muskingum",  col: 7,  row: 5 },
  { fips: "39121", name: "Noble",      col: 8,  row: 5 },
  { fips: "39111", name: "Monroe",     col: 9,  row: 5 },

  // Row 7: 8 counties
  { fips: "39109", name: "Miami",      col: 0,  row: 6 },
  { fips: "39023", name: "Clark",      col: 1,  row: 6 },
  { fips: "39057", name: "Greene",     col: 2,  row: 6 },
  { fips: "39047", name: "Fayette",    col: 3,  row: 6 },
  { fips: "39129", name: "Pickaway",   col: 4,  row: 6 },
  { fips: "39073", name: "Hocking",    col: 5,  row: 6 },
  { fips: "39115", name: "Morgan",     col: 6,  row: 6 },
  { fips: "39167", name: "Washington", col: 7,  row: 6 },

  // Row 8: 7 counties
  { fips: "39135", name: "Preble",     col: 0,  row: 7 },
  { fips: "39113", name: "Montgomery", col: 1,  row: 7 },
  { fips: "39027", name: "Clinton",    col: 2,  row: 7 },
  { fips: "39141", name: "Ross",       col: 3,  row: 7 },
  { fips: "39163", name: "Vinton",     col: 4,  row: 7 },
  { fips: "39105", name: "Meigs",      col: 5,  row: 7 },
  { fips: "39053", name: "Gallia",     col: 6,  row: 7 },

  // Row 9: 6 counties
  { fips: "39017", name: "Butler",     col: 0,  row: 8 },
  { fips: "39165", name: "Warren",     col: 1,  row: 8 },
  { fips: "39071", name: "Highland",   col: 2,  row: 8 },
  { fips: "39131", name: "Pike",       col: 3,  row: 8 },
  { fips: "39079", name: "Jackson",    col: 4,  row: 8 },
  { fips: "39087", name": "Lawrence",  col: 5,  row: 8 },

  // Row 10: 5 counties
  { fips: "39061", name: "Hamilton",   col: 0,  row: 9 },
  { fips: "39025", name: "Clermont",   col: 1,  row: 9 },
  { fips: "39015", name: "Brown",      col: 2,  row: 9 },
  { fips: "39001", name: "Adams",      col: 3,  row: 9 },
  { fips: "39145", name: "Scioto",     col: 4,  row: 9 },
];

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

  // Add slight padding
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

const features = counties.map(c => ({
  type: "Feature",
  properties: {
    FIPS: c.fips,
    NAME: c.name
  },
  geometry: {
    type: "Polygon",
    coordinates: makePolygon(c.col, c.row)
  }
}));

const geojson = {
  type: "FeatureCollection",
  features
};

const fs = require('fs');
const path = require('path');
const outPath = path.join(__dirname, '../public/ohio-counties.geojson');
fs.writeFileSync(outPath, JSON.stringify(geojson, null, 2));
console.log(`Written ${features.length} county features to ${outPath}`);
