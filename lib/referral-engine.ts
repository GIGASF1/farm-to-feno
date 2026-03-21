import { ReferralInput, ReferralOutput } from './types';

export function computeReferral(input: ReferralInput): ReferralOutput {
  const {
    age_group,
    diagnosis_suspected,
    eos,
    feno,
    exacerbations_last_12mo,
    ocs_bursts_last_12mo,
    hospitalization_last_12mo,
    ics_laba_status,
    smoking_status,
    travel_time_to_specialty,
  } = input;

  // --- Phenotype assessment ---
  let eosinophilicSignals = 0;
  if (eos >= 300) eosinophilicSignals += 3;
  else if (eos >= 150) eosinophilicSignals += 2;
  else if (eos >= 100) eosinophilicSignals += 1;

  if (feno !== null) {
    if (feno >= 50) eosinophilicSignals += 3;
    else if (feno >= 25) eosinophilicSignals += 2;
  }

  let phenotype_likelihood: ReferralOutput['phenotype_likelihood'];
  let phenotype_confidence: ReferralOutput['phenotype_confidence'];

  if (eosinophilicSignals >= 4) {
    phenotype_likelihood = 'eosinophilic';
    phenotype_confidence = feno !== null ? 'high' : 'moderate';
  } else if (eosinophilicSignals >= 2) {
    phenotype_likelihood = 'mixed';
    phenotype_confidence = 'moderate';
  } else if (smoking_status === 'current' && diagnosis_suspected === 'copd') {
    phenotype_likelihood = 'non-eosinophilic';
    phenotype_confidence = 'moderate';
  } else {
    phenotype_likelihood = 'uncertain';
    phenotype_confidence = 'low';
  }

  // --- Urgency assessment ---
  let urgencyScore = 0;
  if (hospitalization_last_12mo >= 1) urgencyScore += 3;
  if (exacerbations_last_12mo >= 3) urgencyScore += 3;
  else if (exacerbations_last_12mo >= 2) urgencyScore += 2;
  if (ocs_bursts_last_12mo >= 3) urgencyScore += 2;
  else if (ocs_bursts_last_12mo >= 2) urgencyScore += 1;
  if (ics_laba_status === 'none' || ics_laba_status === 'ics_only') urgencyScore += 1;

  let urgency: ReferralOutput['urgency'];
  if (urgencyScore >= 5) urgency = 'urgent';
  else if (urgencyScore >= 3) urgency = 'expedited';
  else urgency = 'routine';

  // --- Advanced review candidacy ---
  const candidate_for_advanced_review = (
    exacerbations_last_12mo >= 2 ||
    hospitalization_last_12mo >= 1 ||
    ocs_bursts_last_12mo >= 2
  ) && ics_laba_status !== 'none';

  const candidate_for_biologic_discussion = (
    candidate_for_advanced_review &&
    (phenotype_likelihood === 'eosinophilic' || phenotype_likelihood === 'mixed') &&
    (eos >= 150 || (feno !== null && feno >= 25))
  );

  // --- Suggested workup ---
  const suggested_workup: string[] = [];
  if (feno === null) suggested_workup.push('FeNO measurement (if not done)');
  if (eos < 100) suggested_workup.push('Repeat CBC with differential to confirm eosinophil count');
  suggested_workup.push('Spirometry with bronchodilator response');
  if (diagnosis_suspected === 'asthma' || diagnosis_suspected === 'unknown') {
    suggested_workup.push('Allergen sensitization panel (IgE, specific allergens)');
  }
  if (diagnosis_suspected === 'copd' || diagnosis_suspected === 'overlap') {
    suggested_workup.push('DLCO / lung volumes if not done');
    suggested_workup.push('Alpha-1 antitrypsin level');
  }
  suggested_workup.push('Medication adherence and inhaler technique assessment');
  suggested_workup.push('Review prior imaging (CXR, CT if available)');

  // Suppress unused variable warning
  void age_group;

  // --- Referral packet ---
  const referral_packet_checklist = [
    'Spirometry reports (most recent and historical)',
    'CBC with differential (eosinophil count)',
    feno !== null ? `FeNO result: ${feno} ppb` : 'FeNO measurement pending',
    'Medication list with dosing and adherence history',
    `OCS bursts in past 12 months: ${ocs_bursts_last_12mo}`,
    `Exacerbations in past 12 months: ${exacerbations_last_12mo}`,
    hospitalization_last_12mo >= 1 ? 'Hospitalization records' : '',
    'Allergy/atopy history',
    'Smoking history (pack-years)',
    'Insurance / prior authorization information',
    'Referring provider contact for care coordination',
  ].filter(Boolean) as string[];

  // --- Care coordination notes ---
  const care_coordination_notes: string[] = [];
  if (travel_time_to_specialty > 60) {
    care_coordination_notes.push(
      `Travel distance is significant (${travel_time_to_specialty} min to specialty). Consider telehealth pre-consultation.`
    );
  }
  if (candidate_for_biologic_discussion) {
    care_coordination_notes.push('Patient may benefit from biologic access navigator if available.');
  }
  if (urgency === 'urgent') {
    care_coordination_notes.push(
      'Recommend direct communication with specialist office to facilitate timely scheduling.'
    );
  }
  care_coordination_notes.push(
    'Confirm insurance coverage and prior authorization requirements before specialty referral.'
  );

  // --- Intervention types ---
  const intervention_type: string[] = [];
  if (travel_time_to_specialty > 60) intervention_type.push('Tele-pulmonary pre-consultation');
  if (candidate_for_advanced_review) intervention_type.push('Pulmonary specialty referral');
  if (candidate_for_biologic_discussion) intervention_type.push('Biologic pathway evaluation');
  if (ocs_bursts_last_12mo >= 2) intervention_type.push('OCS stewardship review');
  intervention_type.push('PCP education on phenotype-driven asthma management');

  return {
    phenotype_likelihood,
    phenotype_confidence,
    urgency,
    candidate_for_advanced_review,
    candidate_for_biologic_discussion,
    suggested_workup,
    referral_packet_checklist,
    care_coordination_notes,
    intervention_type,
    disclaimer:
      'This tool is for educational, referral optimization, and population-health planning purposes only. It is not intended to diagnose, treat, or replace clinician judgment. All clinical decisions must be made by qualified healthcare providers.',
  };
}
