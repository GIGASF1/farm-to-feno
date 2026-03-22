'use client';

import React, { useState, useMemo } from 'react';
import {
  Database, ExternalLink, Search, ChevronDown, ChevronUp,
  MapPin, Users, Mountain, Activity, Building2, CheckCircle2,
  ArrowUpDown, Info,
} from 'lucide-react';
import realData from '@/data/processed/real-county-data.json';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';

type SortKey = 'county_name' | 'population_2020' | 'rucc_code' | 'asthma_prevalence_pct' | 'appalachian';
type SortDir = 'asc' | 'desc';

const RUCC_LABELS: Record<number, string> = {
  1: 'Metro 1M+',
  2: 'Metro 250K–1M',
  3: 'Metro <250K',
  4: 'Nonmetro 20K+ adj',
  5: 'Nonmetro 20K+ nonadj',
  6: 'Nonmetro 5K–20K adj',
  7: 'Nonmetro 5K–20K nonadj',
  8: 'Nonmetro <5K adj',
  9: 'Nonmetro <5K nonadj',
};

const RUCC_COLORS: Record<number, string> = {
  1: '#dbeafe', 2: '#93c5fd', 3: '#60a5fa',
  4: '#fde68a', 5: '#fcd34d', 6: '#fbbf24',
  7: '#fdba74', 8: '#f97316', 9: '#ea580c',
};

export default function RealDataPage() {
  const [sortKey, setSortKey] = useState<SortKey>('asthma_prevalence_pct');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSources, setExpandedSources] = useState(true);

  const counties = realData.counties;
  const meta = realData.metadata;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = q
      ? counties.filter(c => c.county_name.toLowerCase().includes(q))
      : counties;
    return [...filtered].sort((a, b) => {
      let va: number | string, vb: number | string;
      if (sortKey === 'appalachian') {
        va = a.appalachian ? 1 : 0;
        vb = b.appalachian ? 1 : 0;
      } else {
        va = a[sortKey];
        vb = b[sortKey];
      }
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
  }, [counties, sortKey, sortDir, searchQuery]);

  // Chart data
  const top15Asthma = useMemo(() =>
    [...counties].sort((a, b) => b.asthma_prevalence_pct - a.asthma_prevalence_pct).slice(0, 15).map(c => ({
      name: c.county_name,
      prevalence: c.asthma_prevalence_pct,
      appalachian: c.appalachian,
    })),
  [counties]);

  const ruccDistribution = useMemo(() => {
    const counts: Record<number, number> = {};
    counties.forEach(c => { counts[c.rucc_code] = (counts[c.rucc_code] || 0) + 1; });
    return Object.entries(counts).map(([code, count]) => ({
      name: RUCC_LABELS[Number(code)] || `Code ${code}`,
      value: count,
      code: Number(code),
    })).sort((a, b) => a.code - b.code);
  }, [counties]);

  const appalachianVsNon = useMemo(() => {
    const app = counties.filter(c => c.appalachian);
    const non = counties.filter(c => !c.appalachian);
    const avgApp = app.reduce((s, c) => s + c.asthma_prevalence_pct, 0) / app.length;
    const avgNon = non.reduce((s, c) => s + c.asthma_prevalence_pct, 0) / non.length;
    return [
      { name: 'Appalachian (32)', avg: Number(avgApp.toFixed(2)), count: app.length },
      { name: 'Non-Appalachian (56)', avg: Number(avgNon.toFixed(2)), count: non.length },
    ];
  }, [counties]);

  const metroVsNonmetro = useMemo(() => {
    const met = counties.filter(c => c.is_metro);
    const non = counties.filter(c => !c.is_metro);
    const avgMet = met.reduce((s, c) => s + c.asthma_prevalence_pct, 0) / met.length;
    const avgNon = non.reduce((s, c) => s + c.asthma_prevalence_pct, 0) / non.length;
    return [
      { name: `Metro (${met.length})`, avg: Number(avgMet.toFixed(2)) },
      { name: `Nonmetro (${non.length})`, avg: Number(avgNon.toFixed(2)) },
    ];
  }, [counties]);

  const pieData = useMemo(() => [
    { name: 'Appalachian', value: counties.filter(c => c.appalachian).length, fill: '#ef4444' },
    { name: 'Non-Appalachian', value: counties.filter(c => !c.appalachian).length, fill: '#22c55e' },
  ], [counties]);

  const SortIcon = ({ col }: { col: SortKey }) => (
    <ArrowUpDown className={`h-3 w-3 inline ml-1 ${sortKey === col ? 'text-sky-600' : 'text-slate-300'}`} />
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 text-emerald-200 text-sm font-medium mb-4">
            <Database className="h-4 w-4" />
            Verified Public Data Sources
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Real Data Explorer</h1>
          <p className="text-emerald-100 max-w-2xl text-lg">
            All 88 Ohio counties with verified data from CDC PLACES, USDA ERS, ARC, and U.S. Census.
            Every data point is cited to its public source.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* State-level context cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Activity className="h-5 w-5" />} value="10.4%" label="Ohio Adult Asthma Prevalence" sub="CDC BRFSS 2021" color="text-blue-600" />
          <StatCard icon={<Users className="h-5 w-5" />} value="955,568" label="Ohio Adults with Asthma" sub="CDC BRFSS 2021" color="text-indigo-600" />
          <StatCard icon={<Mountain className="h-5 w-5" />} value="32" label="Appalachian Counties" sub="ARC Official List" color="text-red-600" />
          <StatCard icon={<Building2 className="h-5 w-5" />} value="33 / 69 / 205" label="CAHs / RHCs / FQHC Sites" sub="Rural Health Info Hub" color="text-amber-600" />
        </div>

        {/* Definitions card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Info className="h-5 w-5 text-sky-600" />
            Key Definitions
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-4">
              <div className="font-semibold text-violet-800 mb-1">CAH — Critical Access Hospital</div>
              <p className="text-violet-700">Small rural hospitals (&le;25 beds) designated by CMS receiving cost-based reimbursement to maintain viability in underserved areas.</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <div className="font-semibold text-amber-800 mb-1">RHC — Rural Health Clinic</div>
              <p className="text-amber-700">CMS-certified clinics in rural, medically underserved areas receiving enhanced Medicare/Medicaid reimbursement to attract providers.</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <div className="font-semibold text-emerald-800 mb-1">FQHC — Federally Qualified Health Center</div>
              <p className="text-emerald-700">Federally-funded community health centers providing primary care regardless of ability to pay. Often the only access point in underserved areas.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm mt-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="font-semibold text-blue-800 mb-1">RUCC — Rural-Urban Continuum Code</div>
              <p className="text-blue-700">USDA 9-point scale classifying counties. Codes 1–3 = metropolitan; 4–9 = nonmetropolitan, with higher numbers indicating more rural and isolated areas.</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="font-semibold text-red-800 mb-1">ARC Appalachian Designation</div>
              <p className="text-red-700">32 Ohio counties officially designated by the Appalachian Regional Commission, often facing higher poverty, health disparities, and limited healthcare infrastructure.</p>
            </div>
          </div>
        </div>

        {/* Sources accordion */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
            onClick={() => setExpandedSources(!expandedSources)}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-slate-900">Data Sources & Citations ({meta.sources.length} sources)</span>
            </div>
            {expandedSources ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          </button>
          {expandedSources && (
            <div className="border-t border-slate-100 divide-y divide-slate-100">
              {meta.sources.map((src) => (
                <div key={src.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-slate-900">{src.name}</div>
                      <div className="text-sm text-slate-500 mt-0.5">{src.description}</div>
                      <div className="text-xs text-slate-400 mt-1 italic">{src.citation}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">{src.year}</span>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 hover:text-sky-800 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top 15 by asthma prevalence */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-1">Top 15 Counties by Asthma Prevalence</h3>
            <p className="text-xs text-slate-500 mb-4">CDC PLACES 2023, age-adjusted adult current asthma (%)</p>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={top15Asthma} layout="vertical" margin={{ left: 80, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[9, 13]} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
                <RechartsTooltip
                  formatter={(value) => [`${value}%`, 'Asthma Prevalence']}
                />
                <Bar dataKey="prevalence" radius={[0, 4, 4, 0]}>
                  {top15Asthma.map((entry, i) => (
                    <Cell key={i} fill={entry.appalachian ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Appalachian</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Non-Appalachian</span>
            </div>
          </div>

          {/* RUCC distribution */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-1">Rural-Urban Classification Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">USDA Rural-Urban Continuum Codes 2023</p>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={ruccDistribution} margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip formatter={(value) => [`${value} counties`, 'Count']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {ruccDistribution.map((entry, i) => (
                    <Cell key={i} fill={RUCC_COLORS[entry.code] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span>Codes 1–3 = Metro</span>
              <span>Codes 4–9 = Nonmetro (rural)</span>
            </div>
          </div>

          {/* Appalachian vs Non comparison */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-1">Asthma Prevalence: Appalachian vs Non-Appalachian</h3>
            <p className="text-xs text-slate-500 mb-4">Average county-level adult asthma prevalence by ARC designation</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={appalachianVsNon} margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[10, 12]} tick={{ fontSize: 12 }} />
                <RechartsTooltip formatter={(value) => [`${value}%`, 'Avg Asthma Prevalence']} />
                <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                  <Cell fill="#ef4444" />
                  <Cell fill="#22c55e" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Metro vs Nonmetro comparison */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-1">Asthma Prevalence: Metro vs Nonmetro</h3>
            <p className="text-xs text-slate-500 mb-4">Average county-level adult asthma prevalence by USDA metro status</p>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="50%" height={200}>
                <BarChart data={metroVsNonmetro} margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[10, 12]} tick={{ fontSize: 12 }} />
                  <RechartsTooltip formatter={(value) => [`${value}%`, 'Avg Prevalence']} />
                  <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                    <Cell fill="#3b82f6" />
                    <Cell fill="#f97316" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CAH list */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Ohio Critical Access Hospitals (33 identified)</h3>
          <p className="text-xs text-slate-500 mb-4">Source: CMS NPI Registry / Rural Health Information Hub</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {realData.cahs_identified.map((name, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700 bg-violet-50 rounded px-3 py-2">
                <Building2 className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Full county table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">All 88 Ohio Counties — Verified Data</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click column headers to sort. All data from public sources cited above.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Search county..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('county_name')}>
                    County <SortIcon col="county_name" />
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700 cursor-pointer hover:bg-slate-100 text-right" onClick={() => toggleSort('population_2020')}>
                    Pop. (2020) <SortIcon col="population_2020" />
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700 cursor-pointer hover:bg-slate-100 text-center" onClick={() => toggleSort('asthma_prevalence_pct')}>
                    Asthma % <SortIcon col="asthma_prevalence_pct" />
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700 cursor-pointer hover:bg-slate-100 text-center" onClick={() => toggleSort('rucc_code')}>
                    RUCC <SortIcon col="rucc_code" />
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700">Metro / Nonmetro</th>
                  <th className="px-4 py-3 font-medium text-slate-700 cursor-pointer hover:bg-slate-100 text-center" onClick={() => toggleSort('appalachian')}>
                    Appalachian <SortIcon col="appalachian" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map(c => (
                  <tr key={c.county_fips} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-900">
                      <a href={`/county/${c.county_fips}`} className="hover:text-sky-600 hover:underline">
                        {c.county_name}
                      </a>
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-600 font-mono text-xs">
                      {c.population_2020.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        c.asthma_prevalence_pct >= 11.5 ? 'bg-red-100 text-red-700' :
                        c.asthma_prevalence_pct >= 11.0 ? 'bg-orange-100 text-orange-700' :
                        c.asthma_prevalence_pct >= 10.5 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {c.asthma_prevalence_pct}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className="inline-block w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                        style={{ backgroundColor: RUCC_COLORS[c.rucc_code] || '#e2e8f0', color: c.rucc_code >= 7 ? 'white' : '#1e293b' }}
                        title={c.rucc_description}
                      >
                        {c.rucc_code}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                      {c.is_metro ? (
                        <span className="text-blue-600 font-medium">Metro</span>
                      ) : (
                        <span className="text-orange-600 font-medium">Nonmetro</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {c.appalachian ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
                          <MapPin className="h-3 w-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
            Showing {sorted.length} of 88 counties. All data verified from public sources.
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-sm text-emerald-800">
          <p className="font-semibold mb-2">Data Transparency Note</p>
          <p>
            All data on this page comes from publicly available U.S. government sources. Asthma prevalence
            is from CDC PLACES (county-level, age-adjusted, model-based estimates). Rural classification
            uses USDA 2023 Rural-Urban Continuum Codes. Appalachian designation follows the official ARC
            county list. Population data is from the 2020 U.S. Census. Healthcare facility counts are
            from the Rural Health Information Hub and CMS NPI Registry.
          </p>
          <p className="mt-2 text-emerald-600">
            For the most current data, visit the source URLs listed in the citations above.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, sub, color }: {
  icon: React.ReactNode; value: string; label: string; sub: string; color: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
      <div className={`inline-flex items-center justify-center mb-2 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-600 mt-1">{label}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}
