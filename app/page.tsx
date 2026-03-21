import React from 'react';
import Link from 'next/link';
import {
  Map, BarChart2, Upload, BookOpen, FlaskConical, AlertTriangle,
  MapPin, Users, Wind, TrendingUp,
} from 'lucide-react';
import { getStateAverages } from '@/lib/data';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const stats = getStateAverages();

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-sky-500/20 border border-sky-500/30 rounded-full px-4 py-1.5 text-sky-300 text-sm font-medium mb-6">
            <Wind className="h-4 w-4" />
            Ohio Respiratory Equity Initiative
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            Bridging Rural Ohio to{' '}
            <span className="text-sky-400">Precision Airway Care</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            A geospatial respiratory equity platform for asthma, COPD, referral optimization, and
            advanced therapy access across all 88 Ohio counties.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/map">
              <Button size="lg" className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8">
                <Map className="h-5 w-5 mr-2" />
                Explore the Map
              </Button>
            </Link>
            <Link href="/insights">
              <Button size="lg" variant="outline" className="border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white">
                <BarChart2 className="h-5 w-5 mr-2" />
                View Insights
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="bg-white border-b border-slate-200 py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<MapPin className="h-5 w-5" />}
              value="88"
              label="Ohio Counties Analyzed"
              color="text-sky-600"
            />
            <StatCard
              icon={<AlertTriangle className="h-5 w-5" />}
              value={stats.high_opportunity_count.toString()}
              label="High-Opportunity Counties"
              color="text-orange-600"
            />
            <StatCard
              icon={<Users className="h-5 w-5" />}
              value={stats.appalachian_county_count.toString()}
              label="Appalachian Counties"
              color="text-red-600"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              value={`${Math.round(stats.avg_hub_distance)} mi`}
              label="Avg Distance to Specialty"
              color="text-slate-600"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-3">Platform Modules</h2>
          <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">
            Built for health systems, rural PCP networks, pharma medical affairs, and care
            coordination teams working to close Ohio&apos;s respiratory equity gap.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              href="/map"
              icon={<Map className="h-6 w-6" />}
              iconBg="bg-sky-100 text-sky-600"
              title="Ohio Equity Map"
              description="Interactive choropleth map with county-level asthma burden, rurality, Appalachian designation, and specialty access gap visualization."
            />
            <FeatureCard
              href="/insights"
              icon={<BarChart2 className="h-6 w-6" />}
              iconBg="bg-emerald-100 text-emerald-600"
              title="Executive Insights"
              description="Strategic dashboard with top opportunity counties, burden-access mismatch analysis, and stakeholder-specific recommendations."
            />
            <FeatureCard
              href="/referral"
              icon={<FlaskConical className="h-6 w-6" />}
              iconBg="bg-violet-100 text-violet-600"
              title="Referral Model"
              description="Rules-based clinical referral engine using FeNO, eosinophil count, exacerbation history, and OCS burden to optimize specialty referrals."
            />
            <FeatureCard
              href="/upload"
              icon={<Upload className="h-6 w-6" />}
              iconBg="bg-amber-100 text-amber-600"
              title="Upload Analytics"
              description="Upload de-identified patient datasets to identify OCS burden pockets, biologic access gaps, and eosinophilic phenotype clusters by county."
            />
            <FeatureCard
              href="/methodology"
              icon={<BookOpen className="h-6 w-6" />}
              iconBg="bg-rose-100 text-rose-600"
              title="Methodology"
              description="Full data sources, opportunity score algorithm documentation, assumptions, known limitations, and next data integration roadmap."
            />
            <FeatureCard
              href="/county/39145"
              icon={<MapPin className="h-6 w-6" />}
              iconBg="bg-slate-100 text-slate-600"
              title="County Profiles"
              description="Deep-dive county profiles with full metrics, facility maps, opportunity score breakdown, and referral recommendations."
            />
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-slate-900 text-white py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Why Farm to FeNO?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Fractional exhaled nitric oxide (FeNO) is a biomarker-driven tool for phenotyping
            airway inflammation — yet access to FeNO testing and pulmonary specialty care remains
            profoundly unequal across Ohio&apos;s rural and Appalachian communities.
          </p>
          <p className="text-slate-300 leading-relaxed">
            Farm to FeNO maps where this gap is largest, identifies which patients are most likely
            to benefit from advanced phenotype-directed therapy, and optimizes the referral pathway
            from rural primary care to specialty centers.
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="bg-slate-800 text-slate-400 py-6 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              <strong className="text-slate-300">Research &amp; Educational Tool:</strong> All data
              presented is simulated seed data for demonstration purposes. This application is not
              intended to diagnose, treat, or replace clinician judgment. All clinical decisions
              must be made by qualified healthcare providers. Data should be validated against
              current CDC BRFSS, Ohio Department of Health, and CMS sources before operational use.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="text-center p-4">
      <div className={`inline-flex items-center justify-center mb-2 ${color}`}>{icon}</div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  iconBg,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-sky-200 transition-all group"
    >
      <div className={`inline-flex p-2.5 rounded-lg ${iconBg} mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </Link>
  );
}
