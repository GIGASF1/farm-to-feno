import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const dataSources = [
  {
    name: 'CDC BRFSS (Behavioral Risk Factor Surveillance System)',
    metric: 'Adult asthma prevalence by state/county',
    status: 'Planned',
    notes: 'Current data uses simulated county-level extrapolations from Ohio BRFSS state estimates.',
  },
  {
    name: 'Ohio Department of Health OHFLAC / IPHIS',
    metric: 'Asthma ED visits, hospitalizations per 10,000',
    status: 'Planned',
    notes: 'Seed data uses estimated rates. Real data requires ODH data use agreement.',
  },
  {
    name: 'HRSA Health Resources & Services Administration',
    metric: 'FQHC and RHC locations and service areas',
    status: 'Placeholder',
    notes: 'Facility data is simulated. HRSA Data Warehouse provides actual facility coordinates.',
  },
  {
    name: 'CMS Critical Access Hospital List',
    metric: 'CAH locations and Medicare participation',
    status: 'Placeholder',
    notes: 'Real CAH data available from CMS Provider of Service file.',
  },
  {
    name: 'Appalachian Regional Commission (ARC)',
    metric: 'Appalachian county designation (29 Ohio counties)',
    status: 'Active',
    notes: 'ARC county list applied. 29 Ohio counties are ARC-designated Appalachian.',
  },
  {
    name: 'USDA Rural-Urban Commuting Area (RUCA) Codes',
    metric: 'Rural/Urban/Suburban classification',
    status: 'Placeholder',
    notes: 'Current rurality classification uses approximations. RUCA codes provide zip-code level granularity.',
  },
  {
    name: 'CMS Medicare Claims / Geographic Variation',
    metric: 'Medicare asthma/COPD chronic disease burden',
    status: 'Planned',
    notes: 'Medicare geographic variation file contains county-level prevalence for 65+ beneficiaries.',
  },
  {
    name: 'Google Maps Distance Matrix API',
    metric: 'Drive time to nearest pulmonary specialty hub',
    status: 'Placeholder',
    notes: 'Current travel times are estimated. Real data requires geocoding and routing API calls.',
  },
  {
    name: 'Ohio Medicaid Encounter Data',
    metric: 'OCS prescription rates, biologic exposure, hospitalization',
    status: 'Planned',
    notes: 'Requires data use agreement with Ohio Department of Medicaid. Highest-value dataset for validation.',
  },
];

const scoreComponents = [
  { label: 'Asthma Burden', weight: '25%', desc: 'Adult asthma prevalence normalized across all 88 Ohio counties.' },
  { label: 'ED / Hospital Burden', weight: '20%', desc: 'Composite of asthma ED visit rate and hospitalization rate, each weighted 50/50.' },
  { label: 'Rurality + Appalachian', weight: '15%', desc: 'Rural status scored Urban=10, Suburban=30, Rural=70, Highly Rural=90. Appalachian designation adds +10 points.' },
  { label: 'Specialty Access Gap', weight: '20%', desc: 'Drive distance to nearest pulmonary specialty hub, normalized to 0-100.' },
  { label: 'Safety-Net Facility Access', weight: '10%', desc: 'Inverted density of FQHCs + RHCs + CAHs per 10,000 population. Fewer facilities = higher score.' },
  { label: 'Medicare Chronic Burden', weight: '10%', desc: 'Medicare asthma/COPD index normalized across counties — proxy for older, sicker rural population.' },
];

const limitations = [
  'All county-level metrics are SEED/MOCK data based on estimated extrapolations, not verified public health surveillance.',
  'The GeoJSON county boundaries are simplified rectangular approximations, not accurate TIGER/Line boundaries.',
  'Facility data is illustrative; actual FQHC, RHC, and CAH locations require HRSA data downloads.',
  'Drive times are estimated; actual routing requires Google Maps or OSRM integration.',
  'The referral engine is a rules-based educational model, not a validated clinical decision support tool.',
  'Opportunity scores reflect relative county rankings, not absolute need quantification.',
  'Child asthma prevalence is estimated as 80% of adult prevalence — a rough heuristic.',
  'Medicare and Medicaid data sources are placeholder estimates; real data requires data use agreements.',
];

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Methodology & Data Sources</h1>
        <p className="text-slate-500 mt-2">
          Technical documentation for the Farm to FeNO opportunity score, data pipeline, and
          referral engine.
        </p>
      </div>

      {/* Data Sources */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Data Sources</h2>
        <div className="space-y-3">
          {dataSources.map((ds, i) => (
            <Card key={i}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">{ds.name}</div>
                    <div className="text-xs text-slate-500 mt-1 mb-2">Metric: {ds.metric}</div>
                    <div className="text-xs text-slate-600">{ds.notes}</div>
                  </div>
                  <StatusBadge status={ds.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Opportunity Score Formula */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Opportunity Score Formula</h2>
        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 font-mono text-sm mb-5 overflow-x-auto">
          <div className="text-slate-400 mb-2">// Weighted composite score (0-100)</div>
          <div>OpportunityScore =</div>
          <div className="pl-4 text-sky-300">0.25 × AsthmaPrevalenceScore</div>
          <div className="pl-4 text-sky-300">+ 0.20 × (0.5 × EDRateScore + 0.5 × HospitalizationScore)</div>
          <div className="pl-4 text-sky-300">+ 0.15 × RuralityAppalachianScore</div>
          <div className="pl-4 text-sky-300">+ 0.20 × SpecialtyAccessGapScore</div>
          <div className="pl-4 text-sky-300">+ 0.10 × SafetyNetScore</div>
          <div className="pl-4 text-sky-300">+ 0.10 × MedicareBurdenScore</div>
          <div className="mt-3 text-slate-400">// Each component normalized 0-100 relative to Ohio county min/max</div>
          <div className="text-slate-400">// Score labels: Low(0-24) | Moderate(25-49) | High(50-74) | Very High(75-100)</div>
        </div>

        <div className="space-y-3">
          {scoreComponents.map((c, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl">
              <div className="flex-shrink-0 w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-sky-600">{c.weight}</span>
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">{c.label}</div>
                <div className="text-xs text-slate-600 mt-1">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Referral Engine */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Referral Engine Logic</h2>
        <Card>
          <CardContent className="pt-5 space-y-4 text-sm text-slate-600">
            <div>
              <div className="font-semibold text-slate-800 mb-1">Phenotype Assessment</div>
              <p>Eosinophilic signals are scored: eos ≥300 (+3 pts), eos 150-299 (+2 pts), eos 100-149 (+1 pt). FeNO ≥50 (+3 pts), FeNO 25-49 (+2 pts). Total ≥4 = eosinophilic (high confidence with FeNO), ≥2 = mixed, otherwise uncertain or non-eosinophilic if current smoker with COPD.</p>
            </div>
            <div>
              <div className="font-semibold text-slate-800 mb-1">Urgency Scoring</div>
              <p>Hospitalization in past 12 months (+3), ≥3 exacerbations (+3), 2 exacerbations (+2), ≥3 OCS bursts (+2), 2 OCS bursts (+1), no/minimal therapy (+1). Urgent ≥5, Expedited ≥3, Routine otherwise.</p>
            </div>
            <div>
              <div className="font-semibold text-slate-800 mb-1">Biologic Candidacy</div>
              <p>Requires: ≥2 exacerbations OR hospitalization OR ≥2 OCS bursts AND on controller therapy (ICS-based) AND eosinophilic/mixed phenotype AND eos ≥150 or FeNO ≥25 ppb.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              This referral engine is a rules-based educational model only. It is not FDA-cleared,
              not validated in clinical studies, and does not replace physician assessment.
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Limitations */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Known Limitations</h2>
        <div className="space-y-2">
          {limitations.map((lim, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
              <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">{lim}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Roadmap — Next Data Integrations</h2>
        <div className="space-y-2">
          {[
            'Census TIGER/Line county GeoJSON for accurate choropleth boundaries',
            'Ohio BRFSS micro-data for validated county-level asthma prevalence',
            'HRSA Uniform Data System for FQHC patient volume and asthma encounter rates',
            'ODH IPHIS for hospital-level ED and admission data by county',
            'Ohio Medicaid encounter data for OCS, biologic, and hospitalization claims',
            'Google Maps API integration for actual drive-time routing from each county centroid',
            'ARC Distressed Communities Index for socioeconomic overlay',
            'EPA Air Quality Index data for pollution burden co-morbidity scoring',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <Clock className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Assumptions */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Key Assumptions</h2>
        <div className="space-y-2">
          {[
            'Ohio adult asthma prevalence averages ~11-12% (per CDC BRFSS state estimate)',
            'Appalachian Ohio asthma prevalence is 15-20% higher than non-Appalachian Ohio',
            'Rural counties with >80 mile distance to specialty care represent significant access barriers',
            'Eosinophils ≥150 cells/mcL and FeNO ≥25 ppb are used as phenotyping thresholds (per GINA 2024)',
            'Biologic eligibility estimated at GINA Step 4+ failure with eosinophilic phenotype markers',
            'FQHC, RHC, and CAH presence represents primary safety-net for rural pulmonary pre-work',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-sky-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final disclaimer */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900 text-sm mb-1">Educational Tool — Not Clinical Guidance</p>
          <p className="text-xs text-amber-800 leading-relaxed">
            Farm to FeNO is a population health planning and medical education tool. All data is
            simulated for demonstration. The referral engine does not constitute clinical decision
            support or a medical device. All clinical decisions must be made by licensed healthcare
            providers using validated clinical data.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Active') return <Badge variant="success">{status}</Badge>;
  if (status === 'Planned') return <Badge variant="warning">{status}</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}
