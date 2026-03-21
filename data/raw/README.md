# Raw Data Directory

This directory is intended to hold raw, unprocessed data files before transformation into the `processed/` directory.

## Planned Data Files

- `ohio-brfss-asthma.csv` — Ohio BRFSS county-level asthma estimates (download from CDC)
- `ohio-ed-hospitalizations.csv` — Ohio ED/hospitalization data (from ODH OHFLAC)
- `ohio-facilities-hrsa.csv` — FQHC/RHC locations (download from HRSA Data Warehouse)
- `cms-cah-list.csv` — Critical Access Hospital list (from CMS)
- `ohio-medicaid-ocs.csv` — Ohio Medicaid OCS prescription data (requires DUA with ODH)
- `ohio-county-centroids.csv` — County centroid lat/lng for drive-time calculations
- `arc-appalachian-counties.csv` — ARC Appalachian county designation list

## Data Access Instructions

1. **CDC BRFSS**: https://www.cdc.gov/brfss/annual_data/annual_data.htm
2. **ODH OHFLAC**: https://odh.ohio.gov/know-our-programs/ohio-health-facts-and-figures
3. **HRSA Data Warehouse**: https://data.hrsa.gov/
4. **CMS Provider of Service**: https://data.cms.gov/
5. **ARC County List**: https://www.arc.gov/appalachian-counties/

## Current Status

All data in `processed/` is SIMULATED SEED DATA for demonstration purposes only.
Real data must be sourced from the above agencies and processed through scripts in `../scripts/`.
