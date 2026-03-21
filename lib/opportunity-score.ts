import { CountyMetrics, OpportunityWeights } from './types';

export const DEFAULT_WEIGHTS: OpportunityWeights = {
  asthma_burden: 0.25,
  ed_hospital_burden: 0.20,
  rurality_appalachian: 0.15,
  specialty_access_gap: 0.20,
  safety_net_access: 0.10,
  medicare_chronic_burden: 0.10,
};

// Normalize a value between min and max to 0-100
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

export function computeOpportunityScore(
  county: CountyMetrics,
  allCounties: CountyMetrics[],
  weights: OpportunityWeights = DEFAULT_WEIGHTS
): { score: number; label: string; explanation: string } {
  // Get ranges for normalization
  const prevalences = allCounties.map(c => c.adult_asthma_prevalence);
  const edRates = allCounties.map(c => c.asthma_ed_rate);
  const hospRates = allCounties.map(c => c.asthma_hospitalization_rate);
  const distances = allCounties.map(c => c.pulmonary_hub_distance_miles);
  const medicareBurdens = allCounties.map(c => c.medicare_asthma_indicator);

  const minPrev = Math.min(...prevalences), maxPrev = Math.max(...prevalences);
  const minEd = Math.min(...edRates), maxEd = Math.max(...edRates);
  const minHosp = Math.min(...hospRates), maxHosp = Math.max(...hospRates);
  const minDist = Math.min(...distances), maxDist = Math.max(...distances);
  const minMed = Math.min(...medicareBurdens), maxMed = Math.max(...medicareBurdens);

  // Component scores (higher = more opportunity / more underserved)
  const asthmaScore = normalize(county.adult_asthma_prevalence, minPrev, maxPrev);

  const edScore = normalize(county.asthma_ed_rate, minEd, maxEd);
  const hospScore = normalize(county.asthma_hospitalization_rate, minHosp, maxHosp);
  const burdenScore = (edScore * 0.5 + hospScore * 0.5);

  const ruralScore = ({
    'Urban': 10,
    'Suburban': 30,
    'Rural': 70,
    'Highly Rural': 90,
  } as Record<string, number>)[county.rural_status] + (county.appalachian_flag ? 10 : 0);

  const accessScore = normalize(county.pulmonary_hub_distance_miles, minDist, maxDist);

  // Safety-net: fewer facilities = higher opportunity score
  const facilityDensity = (county.fqhc_count + county.rhc_count + county.cah_count) / Math.max(county.population / 10000, 1);
  const safetyNetScore = Math.max(0, 100 - normalize(facilityDensity, 0, 2));

  const medicareScore = normalize(county.medicare_asthma_indicator, minMed, maxMed);

  const totalScore = (
    weights.asthma_burden * asthmaScore +
    weights.ed_hospital_burden * burdenScore +
    weights.rurality_appalachian * Math.min(100, ruralScore) +
    weights.specialty_access_gap * accessScore +
    weights.safety_net_access * safetyNetScore +
    weights.medicare_chronic_burden * medicareScore
  );

  const score = Math.round(Math.min(100, Math.max(0, totalScore)));

  let label: string;
  if (score < 25) label = 'Low';
  else if (score < 50) label = 'Moderate';
  else if (score < 75) label = 'High';
  else label = 'Very High';

  // Build explanation
  const factors: string[] = [];
  if (asthmaScore > 60) factors.push('elevated asthma burden');
  if (burdenScore > 60) factors.push('high ED/hospitalization rates');
  if (county.rural_status === 'Rural' || county.rural_status === 'Highly Rural') factors.push('rural geography');
  if (county.appalachian_flag) factors.push('Appalachian designation');
  if (accessScore > 60) factors.push('long distance to pulmonary specialty care');
  if (safetyNetScore > 60) factors.push('limited safety-net facility access');
  if (medicareScore > 60) factors.push('elevated Medicare chronic disease burden');

  const explanation = factors.length > 0
    ? `This county scored ${label.toLowerCase()} opportunity because it combines ${factors.slice(0, -1).join(', ')}${factors.length > 1 ? ', and ' : ''}${factors[factors.length - 1]}.`
    : `This county has relatively good pulmonary care access with lower asthma burden relative to Ohio peers.`;

  return { score, label, explanation };
}

export function getScoreColor(score: number): string {
  if (score < 25) return '#22c55e';      // green
  if (score < 50) return '#eab308';      // yellow
  if (score < 75) return '#f97316';      // orange
  return '#ef4444';                       // red
}

export function getScoreColorClass(label: string): string {
  switch (label) {
    case 'Low': return 'text-green-600 bg-green-50 border-green-200';
    case 'Moderate': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'Very High': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}
