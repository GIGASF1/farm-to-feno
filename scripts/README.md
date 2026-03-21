# Scripts

## gen-geojson.js
Generates the simplified Ohio county GeoJSON for the map.

```bash
node scripts/gen-geojson.js
```

Outputs: `public/ohio-counties.geojson`

**Note**: The generated GeoJSON uses rectangular grid-based approximations.
For production, download accurate county boundaries from:
https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html

## Future Scripts

- `fetch-brfss.ts` — Download and process CDC BRFSS Ohio data
- `process-facilities.ts` — Download HRSA facility data and geocode
- `compute-drive-times.ts` — Use Google Maps API to compute actual drive times from county centroids
- `validate-opportunity-scores.ts` — Compare computed scores against real epidemiological data
