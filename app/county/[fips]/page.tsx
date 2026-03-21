import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, MapPin, ArrowLeft, Building2 } from 'lucide-react';
import { getCountyByFips, getFacilitiesByCounty, getStateAverages } from '@/lib/data';
import { getScoreColorClass } from '@/lib/opportunity-score';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CountyChart from './CountyChart';

interface PageProps {
  params: Promise<{ fips: string }>;
}

export default async function CountyPage({ params }: PageProps) {
  const { fips } = await params;
  const county = getCountyByFips(fips);

  if (!county) notFound();

  const facilitiesInCounty = getFacilitiesByCounty(fips);
  const stateAvg = getStateAverages();

  const comparisonData = [
    {
      metric: 'Asthma Prevalence',
      county: county.adult_asthma_prevalence,
      state: stateAvg.avg_asthma_prevalence,
      unit: '%',
    },
    {
      metric: 'ED Rate',
      county: county.asthma_ed_rate,
      state: stateAvg.avg_ed_rate,
      unit: '/10k',
    },
    {
      metric: 'Opp. Score',
      county: county.opportunity_score,
      state: stateAvg.avg_opportunity_score,
      unit: '/100',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-700">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/map" className="hover:text-slate-700">Map</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 font-medium">{county.county_name} County</span>
      </nav>

      {/* Back button */}
      <Link href="/map" className="inline-flex items-center gap-2 text-sm text-sky-600 hover:underline mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to map
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <MapPin className="h-4 w-4" />
            {county.region} Ohio
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{county.county_name} County</h1>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge
              className={`${getScoreColorClass(county.opportunity_label)} text-sm px-3 py-1`}
              variant="outline"
            >
              Opportunity Score: {county.opportunity_score} — {county.opportunity_label}
            </Badge>
            <Badge variant="secondary">{county.rural_status}</Badge>
            {county.appalachian_flag && <Badge variant="danger">Appalachian</Badge>}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/referral?county=${encodeURIComponent(county.county_name)}&travel=${county.pulmonary_hub_travel_time_minutes}`}>
            <Button size="sm">Start Referral Assessment</Button>
          </Link>
        </div>
      </div>

      {/* Opportunity explanation */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
        <h3 className="font-semibold text-slate-800 mb-2">Opportunity Analysis</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{county.opportunity_explanation}</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <MetricBox label="Adult Asthma" value={`${county.adult_asthma_prevalence}%`} highlight={county.adult_asthma_prevalence > 15} />
        <MetricBox label="Child Asthma" value={`${county.child_asthma_prevalence}%`} />
        <MetricBox label="ED Rate" value={`${county.asthma_ed_rate}/10k`} highlight={county.asthma_ed_rate > 35} />
        <MetricBox label="Hosp. Rate" value={`${county.asthma_hospitalization_rate}/10k`} highlight={county.asthma_hospitalization_rate > 12} />
        <MetricBox label="Population" value={county.population.toLocaleString()} />
        <MetricBox label="Medicare Index" value={`${county.medicare_asthma_indicator}/100`} highlight={county.medicare_asthma_indicator > 70} />
        <MetricBox label="COPD Index" value={`${county.copd_indicator}/100`} highlight={county.copd_indicator > 70} />
        <MetricBox label="FQHC Count" value={county.fqhc_count.toString()} />
        <MetricBox label="RHC Count" value={county.rhc_count.toString()} />
        <MetricBox label="CAH Count" value={county.cah_count.toString()} />
      </div>

      {/* Two columns: chart + access */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Comparison chart */}
        <Card>
          <CardHeader>
            <CardTitle>vs. Ohio Average</CardTitle>
          </CardHeader>
          <CardContent>
            <CountyChart data={comparisonData} countyName={county.county_name} />
          </CardContent>
        </Card>

        {/* Specialty Access */}
        <Card>
          <CardHeader>
            <CardTitle>Specialty Care Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-slate-500 mb-1">Nearest Pulmonary Hub</div>
              <div className="font-semibold text-slate-900">{county.nearest_hub}</div>
            </div>
            {county.pulmonary_hub_distance_miles > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Distance</div>
                    <div className={`text-xl font-bold ${county.pulmonary_hub_distance_miles > 80 ? 'text-red-600' : 'text-slate-900'}`}>
                      {county.pulmonary_hub_distance_miles} mi
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Drive Time</div>
                    <div className={`text-xl font-bold ${county.pulmonary_hub_travel_time_minutes > 90 ? 'text-red-600' : 'text-slate-900'}`}>
                      {county.pulmonary_hub_travel_time_minutes} min
                    </div>
                  </div>
                </div>
                {county.pulmonary_hub_travel_time_minutes > 60 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    Travel time exceeds 60 minutes — telehealth pre-consultation recommended.
                  </div>
                )}
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                Pulmonary specialty center located within this county.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Facilities */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-400" />
            Healthcare Facilities in {county.county_name} County
          </CardTitle>
        </CardHeader>
        <CardContent>
          {facilitiesInCounty.length === 0 ? (
            <p className="text-slate-500 text-sm">No facilities recorded in this county (seed data).</p>
          ) : (
            <div className="space-y-2">
              {facilitiesInCounty.map(f => (
                <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-slate-900">{f.name}</div>
                    {f.affiliation && (
                      <div className="text-xs text-slate-500">{f.affiliation}</div>
                    )}
                  </div>
                  <Badge
                    variant={
                      f.type === 'PulmonaryHub'
                        ? 'default'
                        : f.type === 'FQHC'
                        ? 'success'
                        : f.type === 'RHC'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {f.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Opportunity Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ScoreRow label="Asthma Burden (25%)" value={county.adult_asthma_prevalence} max={22} display={`${county.adult_asthma_prevalence}% prevalence`} />
            <ScoreRow label="ED/Hospital Burden (20%)" value={county.asthma_ed_rate} max={55} display={`${county.asthma_ed_rate}/10k ED rate`} />
            <ScoreRow label="Rurality/Appalachian (15%)" value={county.rural_status === 'Highly Rural' ? 90 : county.rural_status === 'Rural' ? 70 : county.rural_status === 'Suburban' ? 30 : 10} max={100} display={`${county.rural_status}${county.appalachian_flag ? ' + Appalachian' : ''}`} />
            <ScoreRow label="Specialty Access Gap (20%)" value={county.pulmonary_hub_distance_miles} max={130} display={`${county.pulmonary_hub_distance_miles} mi to specialty`} />
            <ScoreRow label="Medicare Burden (10%)" value={county.medicare_asthma_indicator} max={100} display={`Index: ${county.medicare_asthma_indicator}/100`} />
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-800 rounded-xl p-6 text-white text-center">
        <h3 className="text-xl font-bold mb-2">Ready to optimize referrals from {county.county_name} County?</h3>
        <p className="text-sky-200 mb-4 text-sm">
          Use the referral model to assess patient phenotype, urgency, and care coordination needs.
        </p>
        <Link href={`/referral?county=${encodeURIComponent(county.county_name)}&travel=${county.pulmonary_hub_travel_time_minutes}`}>
          <Button className="bg-white text-sky-700 hover:bg-sky-50">
            Start Referral Assessment
          </Button>
        </Link>
      </div>
    </div>
  );
}

function MetricBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
      <div className={`text-xl font-bold ${highlight ? 'text-red-600' : 'text-slate-900'}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function ScoreRow({ label, value, max, display }: { label: string; value: number; max: number; display: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-500 text-xs">{display}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-sky-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
