# Farm to FeNO — Data Dictionary

## county-metrics.json

| Field | Type | Unit | Description |
|-------|------|------|-------------|
| county_fips | string | — | 5-digit FIPS code (e.g., "39001") |
| county_name | string | — | County name without "County" |
| region | string | — | Ohio region: Northeast, Northwest, Central, Southeast, Southwest, Appalachian |
| rural_status | string | — | Urban, Suburban, Rural, Highly Rural |
| appalachian_flag | boolean | — | ARC Appalachian designation |
| adult_asthma_prevalence | number | percent | CDC BRFSS adult asthma estimate |
| child_asthma_prevalence | number | percent | Estimated child asthma prevalence |
| asthma_ed_rate | number | per 10,000 | ED visits for asthma primary diagnosis |
| asthma_hospitalization_rate | number | per 10,000 | Inpatient hospitalizations for asthma |
| medicare_asthma_indicator | number | 0-100 index | Composite of Medicare asthma/COPD burden |
| copd_indicator | number | 0-100 index | COPD burden composite index |
| population | number | persons | Total county population |
| fqhc_count | number | count | Federally Qualified Health Centers |
| rhc_count | number | count | Rural Health Clinics |
| cah_count | number | count | Critical Access Hospitals |
| pulmonary_hub_distance_miles | number | miles | Drive distance to nearest pulmonary specialty hub |
| pulmonary_hub_travel_time_minutes | number | minutes | Estimated drive time to nearest hub |
| nearest_hub | string | — | Name of nearest pulmonary specialty center |
| opportunity_score | number | 0-100 | Weighted composite opportunity score |
| opportunity_label | string | — | Low, Moderate, High, Very High |
| opportunity_explanation | string | — | Human-readable explanation of score drivers |
| notes | string | — | Data quality and source notes |

## facilities.json

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique facility ID |
| name | string | Facility name |
| type | string | FQHC, RHC, CAH, PulmonaryHub, Hospital |
| county | string | County name |
| county_fips | string | 5-digit FIPS |
| lat | number | Latitude (WGS84) |
| lng | number | Longitude (WGS84) |
| source | string | Data source |
| affiliation | string | Health system affiliation |

## Upload CSV Schema

| Field | Type | Description |
|-------|------|-------------|
| county | string | Ohio county name |
| patient_id | string | De-identified patient identifier |
| diagnosis | string | asthma, copd, overlap, unknown |
| eos_count | number | Eosinophils cells/mcL |
| feno | number | FeNO ppb (optional) |
| ocs_bursts | number | OCS bursts past 12 months |
| biologic_exposure | boolean | Current or prior biologic exposure |
| hospitalization | boolean | Asthma/COPD hospitalization past 12 months |
| payer | string | Medicaid, Medicare, Commercial, Uninsured |
