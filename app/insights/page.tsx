import React from 'react';
import Link from 'next/link';
import {
  Building2, Users, Map, Stethoscope, Wifi, TrendingUp, AlertTriangle,
} from 'lucide-react';
import {
  getTopCountiesByScore,
  getTopRuralCountiesByBurdenMismatch,
  getStateAverages,
} from '@/lib/data';
import { getScoreColorClass } from '@/lib/opportunity-score';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InsightsPage() {
  const stats = getStateAverages();
  const topByScore = getTopCountiesByScore(10);
  const topByMismatch = getTopRuralCountiesByBurdenMismatch(10);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Strategic Opportunity Dashboard</h1>
        <p className="text-slate-500 mt-2">
          Executive summary of Ohio respiratory equity gaps and strategic intervention opportunities.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard label="High/Very High Opportunity Counties" value={stats.high_opportunity_count} color="text-red-600" />
        <StatCard label="Appalachian Counties" value={stats.appalachian_county_count} color="text-orange-600" />
        <StatCard label="Rural/Highly Rural" value={stats.rural_county_count} color="text-slate-700" />
        <StatCard label="Avg Hub Distance (mi)" value={Math.round(stats.avg_hub_distance)} color="text-sky-600" />
      </div>

      {/* Tables */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Top 10 by opportunity score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              Top 10 by Opportunity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topByScore.map((c, i) => (
                <Link
                  key={c.county_fips}
                  href={`/county/${c.county_fips}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-slate-400 w-5">{i + 1}</span>
                    <div>
                      <span className="font-medium text-sm text-slate-900 group-hover:text-sky-600">
                        {c.county_name}
                      </span>
                      <div className="flex gap-1 mt-0.5">
                        {c.appalachian_flag && (
                          <Badge variant="danger" className="text-xs py-0">Appalachian</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs py-0">{c.rural_status}</Badge>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`${getScoreColorClass(c.opportunity_label)} font-bold`}
                    variant="outline"
                  >
                    {c.opportunity_score}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 10 by burden-access mismatch */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Top 10 Burden-Access Mismatch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topByMismatch.map((c, i) => (
                <Link
                  key={c.county_fips}
                  href={`/county/${c.county_fips}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-slate-400 w-5">{i + 1}</span>
                    <div>
                      <span className="font-medium text-sm text-slate-900 group-hover:text-sky-600">
                        {c.county_name}
                      </span>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {c.adult_asthma_prevalence}% asthma · {c.pulmonary_hub_distance_miles} mi to hub
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Mismatch</div>
                    <div className="font-bold text-sm text-orange-600">
                      {Math.round(c.adult_asthma_prevalence * c.pulmonary_hub_distance_miles)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Recommendations */}
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Strategic Recommendations</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <RecommendationCard
          icon={<Building2 className="h-6 w-6" />}
          iconBg="bg-sky-100 text-sky-600"
          title="For Health Systems"
          items={[
            'Establish tele-pulmonary outreach programs targeting Lawrence, Meigs, Scioto, Vinton, and Gallia counties',
            'Develop mobile spirometry / FeNO programs for FQHC and RHC partnerships',
            'Create rural referral navigator roles embedded in Appalachian PCP practices',
            'Prioritize CAH-to-hub care coordination protocols for high-urgency cases',
          ]}
        />
        <RecommendationCard
          icon={<Stethoscope className="h-6 w-6" />}
          iconBg="bg-emerald-100 text-emerald-600"
          title="For Rural PCP Networks"
          items={[
            'Implement FeNO testing at point-of-care for patients with ≥2 exacerbations/year',
            'Use CBC with differential to track eosinophil trends in uncontrolled asthma',
            'Complete GINA Step 4+ review before specialty referral to reduce unnecessary visits',
            'Adopt phenotype-driven management: eos ≥150 + FeNO ≥25 = biologic evaluation pathway',
          ]}
        />
        <RecommendationCard
          icon={<TrendingUp className="h-6 w-6" />}
          iconBg="bg-violet-100 text-violet-600"
          title="For Pharma Medical Affairs"
          items={[
            'Appalachian Ohio represents highest-burden, lowest-biologic-access region in the state',
            'OCS stewardship programs targeting rural FQHCs can surface biologic-eligible patients',
            'Regional medical education events in Portsmouth, Gallipolis, and Marietta for key accounts',
            'Partner with OhioHealth and Holzer networks on Appalachian respiratory equity initiatives',
          ]}
        />
        <RecommendationCard
          icon={<Users className="h-6 w-6" />}
          iconBg="bg-amber-100 text-amber-600"
          title="For Care Coordination Teams"
          items={[
            'Develop social needs screening for patients with ≥90 min travel to specialty care',
            'Coordinate transportation benefits through Medicaid MCOs for high-urgency rural referrals',
            'Build biologic access navigator programs within hospital-sponsored charity care',
            'Track OCS prescription density as a proxy for uncontrolled, biologic-eligible burden',
          ]}
        />
        <RecommendationCard
          icon={<Wifi className="h-6 w-6" />}
          iconBg="bg-rose-100 text-rose-600"
          title="For Telehealth Programs"
          items={[
            'Asynchronous FeNO result review programs with pulmonologist oversight can extend reach',
            'Pre-consultation telehealth protocols reduce first-visit cancellation for distant patients',
            'Ohio Medicaid covers synchronous telehealth for pulmonology — leverage existing infrastructure',
            'Prioritize broadband-accessible areas first; plan for disconnected populations in Monroe/Noble',
          ]}
        />
        <RecommendationCard
          icon={<Map className="h-6 w-6" />}
          iconBg="bg-slate-100 text-slate-600"
          title="Data & Research Priorities"
          items={[
            'Link county-level FeNO testing rates to specialty referral conversion to measure impact',
            'Integrate Ohio Medicaid claims data to validate opportunity scores with real utilization',
            'Conduct needs assessment surveys with FQHCs in top 15 opportunity counties',
            'Partner with OAFP and Ohio Thoracic Society for educational program co-development',
          ]}
        />
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          All data presented represents simulated seed data for demonstration and planning purposes.
          Opportunity scores and metrics are calculated from modeled estimates and should be
          validated against current-year CDC BRFSS, Ohio Department of Health OHFLAC, and CMS data
          before operational use. Recommendations are educational only.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center">
      <div className={`text-4xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-2 leading-snug">{label}</div>
    </div>
  );
}

function RecommendationCard({
  icon,
  iconBg,
  title,
  items,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  items: string[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className={`inline-flex p-2.5 rounded-lg ${iconBg} mb-3`}>{icon}</div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-sky-500 font-bold flex-shrink-0 mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
