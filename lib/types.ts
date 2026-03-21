export interface CountyMetrics {
  county_fips: string;
  county_name: string;
  region: 'Northeast' | 'Northwest' | 'Central' | 'Southeast' | 'Southwest' | 'Appalachian';
  rural_status: 'Urban' | 'Suburban' | 'Rural' | 'Highly Rural';
  appalachian_flag: boolean;
  adult_asthma_prevalence: number;      // percent
  child_asthma_prevalence: number;      // percent
  asthma_ed_rate: number;               // per 10,000
  asthma_hospitalization_rate: number;  // per 10,000
  medicare_asthma_indicator: number;    // 0-100 index
  copd_indicator: number;               // 0-100 index
  population: number;
  fqhc_count: number;
  rhc_count: number;
  cah_count: number;
  pulmonary_hub_distance_miles: number;
  pulmonary_hub_travel_time_minutes: number;
  nearest_hub: string;
  opportunity_score: number;            // 0-100
  opportunity_label: 'Low' | 'Moderate' | 'High' | 'Very High';
  opportunity_explanation: string;
  notes: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'FQHC' | 'RHC' | 'CAH' | 'PulmonaryHub' | 'Hospital';
  county: string;
  county_fips: string;
  lat: number;
  lng: number;
  source: string;
  affiliation?: string;
}

export interface ReferralInput {
  age_group: 'pediatric' | 'adult';
  diagnosis_suspected: 'asthma' | 'copd' | 'overlap' | 'unknown';
  eos: number;                          // eosinophils cells/mcL
  feno: number | null;                  // ppb, null if not done
  exacerbations_last_12mo: number;
  ocs_bursts_last_12mo: number;
  hospitalization_last_12mo: number;
  ics_laba_status: 'none' | 'ics_only' | 'ics_laba' | 'triple';
  smoking_status: 'never' | 'former' | 'current';
  county: string;
  travel_time_to_specialty: number;     // minutes
  referral_source: string;
}

export interface ReferralOutput {
  phenotype_likelihood: 'eosinophilic' | 'non-eosinophilic' | 'mixed' | 'uncertain';
  phenotype_confidence: 'low' | 'moderate' | 'high';
  urgency: 'routine' | 'urgent' | 'expedited';
  candidate_for_advanced_review: boolean;
  candidate_for_biologic_discussion: boolean;
  suggested_workup: string[];
  referral_packet_checklist: string[];
  care_coordination_notes: string[];
  intervention_type: string[];
  disclaimer: string;
}

export interface OpportunityWeights {
  asthma_burden: number;
  ed_hospital_burden: number;
  rurality_appalachian: number;
  specialty_access_gap: number;
  safety_net_access: number;
  medicare_chronic_burden: number;
}

export type LayerType =
  | 'opportunity_score'
  | 'asthma_prevalence'
  | 'asthma_ed_rate'
  | 'rurality'
  | 'appalachian'
  | 'fqhc'
  | 'rhc'
  | 'cah'
  | 'pulmonary_hubs';

export interface UploadedPatient {
  county: string;
  patient_id: string;
  diagnosis: string;
  eos_count?: number;
  feno?: number;
  ocs_bursts?: number;
  biologic_exposure?: boolean;
  hospitalization?: boolean;
  payer?: string;
}
