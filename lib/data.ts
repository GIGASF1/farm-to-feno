import countyMetricsData from '../data/processed/county-metrics.json';
import facilitiesData from '../data/processed/facilities.json';
import { CountyMetrics, Facility } from './types';

export const countyMetrics: CountyMetrics[] = countyMetricsData as CountyMetrics[];
export const facilities: Facility[] = facilitiesData as Facility[];

export function getCountyByFips(fips: string): CountyMetrics | undefined {
  return countyMetrics.find(c => c.county_fips === fips);
}

export function getCountyByName(name: string): CountyMetrics | undefined {
  return countyMetrics.find(c => c.county_name.toLowerCase() === name.toLowerCase());
}

export function getFacilitiesByCounty(county_fips: string): Facility[] {
  return facilities.filter(f => f.county_fips === county_fips);
}

export function getTopCountiesByScore(n: number = 10): CountyMetrics[] {
  return [...countyMetrics].sort((a, b) => b.opportunity_score - a.opportunity_score).slice(0, n);
}

export function getTopRuralCountiesByBurdenMismatch(n: number = 10): CountyMetrics[] {
  return [...countyMetrics]
    .filter(c => c.rural_status === 'Rural' || c.rural_status === 'Highly Rural')
    .sort(
      (a, b) =>
        b.adult_asthma_prevalence * b.pulmonary_hub_distance_miles -
        a.adult_asthma_prevalence * a.pulmonary_hub_distance_miles
    )
    .slice(0, n);
}

export function getStateAverages() {
  const total = countyMetrics.length;
  return {
    avg_asthma_prevalence:
      countyMetrics.reduce((s, c) => s + c.adult_asthma_prevalence, 0) / total,
    avg_ed_rate: countyMetrics.reduce((s, c) => s + c.asthma_ed_rate, 0) / total,
    avg_hub_distance:
      countyMetrics.reduce((s, c) => s + c.pulmonary_hub_distance_miles, 0) / total,
    avg_opportunity_score:
      countyMetrics.reduce((s, c) => s + c.opportunity_score, 0) / total,
    rural_county_count: countyMetrics.filter(
      c => c.rural_status === 'Rural' || c.rural_status === 'Highly Rural'
    ).length,
    appalachian_county_count: countyMetrics.filter(c => c.appalachian_flag).length,
    high_opportunity_count: countyMetrics.filter(
      c => c.opportunity_label === 'High' || c.opportunity_label === 'Very High'
    ).length,
  };
}
