# Farm to FeNO — Ohio Rural Airway Equity Map

> **Bridging Rural Ohio to Precision Airway Care**
> A geospatial respiratory equity platform for asthma, COPD, referral optimization, and advanced therapy access.

---

## What This Is

Farm to FeNO is a production-style MVP web application designed to help physician leaders, health systems, pharma population-health teams, and rural referral partners identify where patients in Ohio are least likely to reach phenotype-driven pulmonary evaluation and biologic therapy pathways — because of geography, access gaps, and fragmented referral systems.

**It answers:**
- Where in Ohio is asthma burden highest?
- Which counties are rural, access-limited, or underserved for pulmonary specialty care?
- Where is the mismatch between disease burden and advanced-care access?
- Which areas are candidates for outreach, tele-pulmonary, mobile FeNO/spirometry, or biologic pathway development?

---

## Running Locally

> **Important**: This project's source lives in iCloud Drive. Always build and run from the local mirror to avoid iCloud-related node_modules corruption.

```bash
# The local build mirror is at:
cd ~/farm-to-feno-local

# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm run start
```

### If you edit source files in iCloud:
After editing files in `/Users/axr/Library/Mobile Documents/com~apple~CloudDocs/Farm-to-FeNO`, sync changes to the local build:
```bash
rsync -a --exclude='node_modules' --exclude='.next' \
  "/Users/axr/Library/Mobile Documents/com~apple~CloudDocs/Farm-to-FeNO/" \
  ~/farm-to-feno-local/
cd ~/farm-to-feno-local && npm run dev
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Primitives | Radix UI |
| Maps | Leaflet + react-leaflet |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Deployment | Vercel |

---

## App Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, metric cards, module overview |
| `/map` | Ohio interactive choropleth map with layer toggles |
| `/county/[fips]` | County detail: burden, access gaps, intervention recommendations |
| `/referral` | 3-step clinical referral assessment form |
| `/upload` | CSV upload for advanced OCS/biologic analytics |
| `/insights` | Executive strategy dashboard — top 10 counties, strategic actions |
| `/methodology` | Data sources, scoring formula, assumptions, limitations |

---

## Data

### Seed Data (Mock — Replace for Production)

All seed data is clearly labeled as mock/illustrative. Files:

| File | Contents |
|------|----------|
| `data/processed/county-metrics.json` | All 88 Ohio counties with asthma burden, rurality, access, opportunity scores |
| `data/processed/facilities.json` | 37 facilities: pulmonary hubs, FQHCs, RHCs, Critical Access Hospitals |
| `public/ohio-counties.geojson` | Simplified county polygons for the choropleth map |

### Replacing Mock Data with Real Data

| Field | Real Source |
|-------|-------------|
| `adult_asthma_prevalence` | CDC BRFSS county-level estimates |
| `asthma_ed_rate`, `asthma_hospitalization_rate` | Ohio Dept of Health OHFLAC / ODRS |
| `medicare_asthma_indicator` | CMS Chronic Conditions Data Warehouse |
| `fqhc_count`, `rhc_count`, `cah_count` | HRSA Data Warehouse (downloadable CSV) |
| `pulmonary_hub_distance_miles` | Google Maps Distance Matrix API (county centroids) |
| County GeoJSON | US Census TIGER/Line Shapefiles → convert to GeoJSON |

---

## Opportunity Score

Composite score (0–100) computed transparently from:

| Component | Default Weight |
|-----------|---------------|
| Asthma burden percentile | 25% |
| ED/hospitalization burden | 20% |
| Rurality + Appalachian factor | 15% |
| Specialty access gap (distance) | 20% |
| Safety-net/shortage access | 10% |
| Medicare chronic burden | 10% |

Labels: **Low** (0–24) / **Moderate** (25–49) / **High** (50–74) / **Very High** (75–100)

Weights are adjustable via the map dashboard settings panel.

---

## Referral Engine

Rules-based (not LLM) prototype referral assessment for clinician workflow support.

**Inputs:** Age group, diagnosis, eosinophil count, FeNO, exacerbations, OCS bursts, hospitalization, current therapy, smoking status, county, travel time.

**Outputs:** Phenotype likelihood + confidence, urgency level, biologic candidacy, workup checklist, referral packet, care coordination notes.

All outputs include a prominent disclaimer that this tool does not provide medical diagnosis or treatment advice.

---

## Disclaimer

> This tool is for educational, referral optimization, and population-health planning purposes only. It is not intended to diagnose, treat, or replace clinician judgment. All clinical decisions must be made by qualified healthcare providers.

---

## Deployment (Vercel)

```bash
# From local build directory
vercel --prod
```

Set no environment variables required for MVP. Future APIs (Google Maps, Supabase) can be added via Vercel environment settings.

---

## Known Limitations

1. **GeoJSON is approximate** — county polygons use a grid-based approximation. Replace with Census TIGER/Line data for accurate boundaries.
2. **All metrics are seed/mock data** — labeled as illustrative. Do not use for clinical or policy decisions without validated data.
3. **Travel times are estimated from distance** — actual drive times require a routing API.
4. **Referral engine is rules-based** — not validated as a clinical decision support tool; requires clinical review before operational use.
5. **Upload mode** — de-identification of uploaded data is the responsibility of the uploading organization.

---

## Top 5 Next Improvements

1. **Real GeoJSON** — Download Census TIGER/Line Ohio county boundaries and convert to GeoJSON for accurate choropleth rendering
2. **Live data pipeline** — ETL scripts to auto-fetch CDC BRFSS, ODH OHFLAC, and HRSA facility data on a schedule
3. **Stakeholder mode switch** — Role-based views (Physician / Health System Executive / Pharma Strategy / Public Health)
4. **FeNO availability layer** — Map which Ohio counties have FeNO testing at local clinics vs. requiring specialty referral
5. **Authentication + role access** — NextAuth.js for organization-gated views and upload analytics with audit trail

---

## Product Rationale

Ohio has 88 counties spanning highly urban medical centers to deeply rural Appalachian communities. The burden of asthma and COPD is not evenly distributed, and neither is access to pulmonary specialty care, FeNO testing, or biologic therapies. Farm to FeNO makes this mismatch visible — giving health systems, rural PCP networks, pharma medical affairs teams, and population health planners a shared map of where the gaps are and what the opportunity looks like for targeted intervention.

*Built as an MVP. All data is seed/mock unless replaced with validated sources.*
