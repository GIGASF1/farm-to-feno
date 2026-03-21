'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { LayerType, OpportunityWeights } from '@/lib/types';
import { DEFAULT_WEIGHTS } from '@/lib/opportunity-score';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';

interface LayerControlsProps {
  activeLayer: LayerType;
  onLayerChange: (layer: LayerType) => void;
  showFacilities: {
    pulmonary_hubs: boolean;
    fqhc: boolean;
    rhc: boolean;
    cah: boolean;
  };
  onFacilityToggle: (key: keyof LayerControlsProps['showFacilities']) => void;
  weights: OpportunityWeights;
  onWeightsChange: (weights: OpportunityWeights) => void;
}

const metricLayers: { id: LayerType; label: string }[] = [
  { id: 'opportunity_score', label: 'Opportunity Score' },
  { id: 'asthma_prevalence', label: 'Asthma Prevalence' },
  { id: 'asthma_ed_rate', label: 'ED/Hospital Burden' },
  { id: 'rurality', label: 'Rural Status' },
  { id: 'appalachian', label: 'Appalachian Counties' },
];

const facilityOverlays: {
  key: keyof LayerControlsProps['showFacilities'];
  label: string;
  color: string;
}[] = [
  { key: 'pulmonary_hubs', label: 'Pulmonary Hubs', color: 'bg-sky-500' },
  { key: 'fqhc', label: 'FQHCs', color: 'bg-emerald-500' },
  { key: 'rhc', label: 'Rural Health Clinics', color: 'bg-amber-500' },
  { key: 'cah', label: 'Critical Access Hospitals', color: 'bg-violet-500' },
];

export default function LayerControls({
  activeLayer,
  onLayerChange,
  showFacilities,
  onFacilityToggle,
  weights,
  onWeightsChange,
}: LayerControlsProps) {
  const [weightsOpen, setWeightsOpen] = useState(false);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-5">
      {/* Metric Layers */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Metric Layers
        </h3>
        <div className="space-y-1.5">
          {metricLayers.map(layer => (
            <label
              key={layer.id}
              className={cn(
                'flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors text-sm',
                activeLayer === layer.id
                  ? 'bg-sky-50 border border-sky-200 text-sky-800'
                  : 'hover:bg-slate-50 text-slate-700'
              )}
            >
              <input
                type="radio"
                name="layer"
                value={layer.id}
                checked={activeLayer === layer.id}
                onChange={() => onLayerChange(layer.id)}
                className="accent-sky-600"
              />
              {layer.label}
            </label>
          ))}
        </div>
      </div>

      {/* Facility Overlays */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Facility Overlays
        </h3>
        <div className="space-y-1.5">
          {facilityOverlays.map(overlay => (
            <label
              key={overlay.key}
              className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={showFacilities[overlay.key]}
                onChange={() => onFacilityToggle(overlay.key)}
                className="accent-sky-600 rounded"
              />
              <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', overlay.color)} />
              {overlay.label}
            </label>
          ))}
        </div>
      </div>

      {/* Opportunity Score Weights */}
      {activeLayer === 'opportunity_score' && (
        <div>
          <button
            className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2"
            onClick={() => setWeightsOpen(!weightsOpen)}
          >
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Score Weights
            </span>
            {weightsOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>

          {weightsOpen && (
            <div className="space-y-4 bg-slate-50 rounded-lg p-3">
              <WeightSlider
                label="Asthma Burden"
                value={weights.asthma_burden}
                onChange={v => onWeightsChange({ ...weights, asthma_burden: v })}
              />
              <WeightSlider
                label="ED/Hospital Burden"
                value={weights.ed_hospital_burden}
                onChange={v => onWeightsChange({ ...weights, ed_hospital_burden: v })}
              />
              <WeightSlider
                label="Rurality/Appalachian"
                value={weights.rurality_appalachian}
                onChange={v => onWeightsChange({ ...weights, rurality_appalachian: v })}
              />
              <WeightSlider
                label="Specialty Access Gap"
                value={weights.specialty_access_gap}
                onChange={v => onWeightsChange({ ...weights, specialty_access_gap: v })}
              />
              <WeightSlider
                label="Safety-Net Access"
                value={weights.safety_net_access}
                onChange={v => onWeightsChange({ ...weights, safety_net_access: v })}
              />
              <WeightSlider
                label="Medicare Burden"
                value={weights.medicare_chronic_burden}
                onChange={v => onWeightsChange({ ...weights, medicare_chronic_burden: v })}
              />
              <button
                className="text-xs text-sky-600 hover:underline"
                onClick={() => onWeightsChange(DEFAULT_WEIGHTS)}
              >
                Reset to defaults
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WeightSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600 mb-1.5">
        <span>{label}</span>
        <span className="font-semibold">{Math.round(value * 100)}%</span>
      </div>
      <Slider
        min={0}
        max={1}
        step={0.05}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}
