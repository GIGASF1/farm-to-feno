'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Search } from 'lucide-react';
import { countyMetrics, facilities, getCountyByFips } from '@/lib/data';
import { DEFAULT_WEIGHTS } from '@/lib/opportunity-score';
import { LayerType, CountyMetrics, OpportunityWeights } from '@/lib/types';
import LayerControls from '@/components/LayerControls';
import CountyPanel from '@/components/CountyPanel';
import { Input } from '@/components/ui/input';

const OhioMap = dynamic(() => import('@/components/OhioMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [activeLayer, setActiveLayer] = useState<LayerType>('opportunity_score');
  const [showFacilities, setShowFacilities] = useState({
    pulmonary_hubs: true,
    fqhc: false,
    rhc: false,
    cah: false,
  });
  const [weights, setWeights] = useState<OpportunityWeights>(DEFAULT_WEIGHTS);
  const [selectedFips, setSelectedFips] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCounty: CountyMetrics | null = useMemo(
    () => (selectedFips ? getCountyByFips(selectedFips) ?? null : null),
    [selectedFips]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return countyMetrics
      .filter(c => c.county_name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery]);

  const handleFacilityToggle = (key: keyof typeof showFacilities) => {
    setShowFacilities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Left sidebar */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h1 className="font-bold text-slate-900">Ohio Equity Map</h1>
          <p className="text-xs text-slate-500 mt-1">Click a county to explore</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <LayerControls
            activeLayer={activeLayer}
            onLayerChange={setActiveLayer}
            showFacilities={showFacilities}
            onFacilityToggle={handleFacilityToggle}
            weights={weights}
            onWeightsChange={setWeights}
          />
        </div>

        {/* Quick stats */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>High-opp. counties</span>
              <span className="font-semibold text-red-600">
                {countyMetrics.filter(c => c.opportunity_label === 'High' || c.opportunity_label === 'Very High').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Appalachian counties</span>
              <span className="font-semibold">
                {countyMetrics.filter(c => c.appalachian_flag).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Rural/Highly Rural</span>
              <span className="font-semibold">
                {countyMetrics.filter(c => c.rural_status === 'Rural' || c.rural_status === 'Highly Rural').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main map area */}
      <div className="flex-1 relative flex flex-col">
        {/* Search bar */}
        <div className="absolute top-4 left-4 z-[1000] w-72">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9 shadow-md bg-white"
              placeholder="Search county..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
              {searchResults.map(c => (
                <button
                  key={c.county_fips}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 last:border-0"
                  onClick={() => {
                    setSelectedFips(c.county_fips);
                    setSearchQuery('');
                  }}
                >
                  <span className="font-medium">{c.county_name} County</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      c.opportunity_label === 'Very High'
                        ? 'bg-red-100 text-red-700'
                        : c.opportunity_label === 'High'
                        ? 'bg-orange-100 text-orange-700'
                        : c.opportunity_label === 'Moderate'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {c.opportunity_label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <OhioMap
            counties={countyMetrics}
            facilities={facilities}
            activeLayer={activeLayer}
            showFacilities={showFacilities}
            selectedFips={selectedFips}
            onCountyClick={setSelectedFips}
          />

          {/* County detail panel */}
          <CountyPanel
            county={selectedCounty}
            onClose={() => setSelectedFips(null)}
          />
        </div>
      </div>
    </div>
  );
}
