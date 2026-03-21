'use client';

import React from 'react';
import Link from 'next/link';
import { X, MapPin, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CountyMetrics } from '@/lib/types';
import { getScoreColorClass } from '@/lib/opportunity-score';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface CountyPanelProps {
  county: CountyMetrics | null;
  onClose: () => void;
}

export default function CountyPanel({ county, onClose }: CountyPanelProps) {
  return (
    <AnimatePresence>
      {county && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl z-[900] overflow-y-auto border-l border-slate-200"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-slate-100 bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-500 uppercase tracking-wide">
                  {county.region} Ohio
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{county.county_name} County</h2>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge
                  className={getScoreColorClass(county.opportunity_label)}
                  variant="outline"
                >
                  Score: {county.opportunity_score} — {county.opportunity_label}
                </Badge>
                {county.appalachian_flag && (
                  <Badge variant="danger">Appalachian</Badge>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 hover:text-slate-700 transition-colors ml-2 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Opportunity Score Bar */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-700">Opportunity Score</span>
              <span className="font-bold text-slate-900">{county.opportunity_score}/100</span>
            </div>
            <Progress value={county.opportunity_score} className="h-3" />
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {county.opportunity_explanation}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Key Metrics
            </h3>
            <div className="space-y-2">
              <MetricRow
                label="Adult Asthma Prevalence"
                value={`${county.adult_asthma_prevalence}%`}
                highlight={county.adult_asthma_prevalence > 15}
              />
              <MetricRow
                label="Asthma ED Rate"
                value={`${county.asthma_ed_rate}/10k`}
                highlight={county.asthma_ed_rate > 35}
              />
              <MetricRow
                label="Hospitalization Rate"
                value={`${county.asthma_hospitalization_rate}/10k`}
                highlight={county.asthma_hospitalization_rate > 12}
              />
              <MetricRow
                label="COPD Index"
                value={`${county.copd_indicator}/100`}
                highlight={county.copd_indicator > 70}
              />
              <MetricRow
                label="Population"
                value={county.population.toLocaleString()}
              />
            </div>
          </div>

          {/* Access */}
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Specialty Access
            </h3>
            <div className="space-y-2">
              <MetricRow
                label="Nearest Pulmonary Hub"
                value={county.pulmonary_hub_distance_miles === 0 ? 'On-site' : `${county.pulmonary_hub_distance_miles} mi`}
                highlight={county.pulmonary_hub_distance_miles > 80}
              />
              {county.pulmonary_hub_travel_time_minutes > 0 && (
                <MetricRow
                  label="Drive Time"
                  value={`${county.pulmonary_hub_travel_time_minutes} min`}
                  highlight={county.pulmonary_hub_travel_time_minutes > 90}
                />
              )}
              <div className="text-xs text-slate-500 mt-1">{county.nearest_hub}</div>
            </div>
          </div>

          {/* Safety Net */}
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Safety-Net Facilities
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-emerald-50 rounded-lg p-2">
                <div className="text-lg font-bold text-emerald-700">{county.fqhc_count}</div>
                <div className="text-xs text-slate-500">FQHC</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-2">
                <div className="text-lg font-bold text-amber-700">{county.rhc_count}</div>
                <div className="text-xs text-slate-500">RHC</div>
              </div>
              <div className="bg-violet-50 rounded-lg p-2">
                <div className="text-lg font-bold text-violet-700">{county.cah_count}</div>
                <div className="text-xs text-slate-500">CAH</div>
              </div>
            </div>
          </div>

          {/* Rural Status */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{county.rural_status}</Badge>
              <Badge variant="secondary">{county.region}</Badge>
              {county.appalachian_flag && <Badge variant="danger">Appalachian</Badge>}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 space-y-2">
            <Link href={`/county/${county.county_fips}`} className="block">
              <Button className="w-full" size="sm">
                Full County Profile
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href={`/referral?county=${encodeURIComponent(county.county_name)}&travel=${county.pulmonary_hub_travel_time_minutes}`} className="block">
              <Button variant="outline" className="w-full" size="sm">
                Start Referral Assessment
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetricRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-600">{label}</span>
      <span className={highlight ? 'font-semibold text-red-600' : 'font-medium text-slate-900'}>
        {value}
      </span>
    </div>
  );
}
