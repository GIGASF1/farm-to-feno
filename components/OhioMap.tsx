'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, GeoJSON, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CountyMetrics, Facility, LayerType } from '@/lib/types';
import { getScoreColor } from '@/lib/opportunity-score';

interface OhioMapProps {
  counties: CountyMetrics[];
  facilities: Facility[];
  activeLayer: LayerType;
  showFacilities: {
    pulmonary_hubs: boolean;
    fqhc: boolean;
    rhc: boolean;
    cah: boolean;
  };
  selectedFips: string | null;
  onCountyClick: (fips: string) => void;
}

// Fix Leaflet default icon issue in Next.js
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

function getLayerColor(county: CountyMetrics, layer: LayerType): string {
  switch (layer) {
    case 'opportunity_score':
      return getScoreColor(county.opportunity_score);
    case 'asthma_prevalence': {
      const v = county.adult_asthma_prevalence;
      if (v < 10) return '#dbeafe';
      if (v < 12) return '#93c5fd';
      if (v < 14) return '#3b82f6';
      if (v < 16) return '#1d4ed8';
      return '#1e3a8a';
    }
    case 'asthma_ed_rate': {
      const v = county.asthma_ed_rate;
      if (v < 20) return '#fed7aa';
      if (v < 28) return '#fb923c';
      if (v < 36) return '#ea580c';
      if (v < 44) return '#c2410c';
      return '#7c2d12';
    }
    case 'rurality': {
      const map: Record<string, string> = {
        Urban: '#f1f5f9',
        Suburban: '#94a3b8',
        Rural: '#475569',
        'Highly Rural': '#1e293b',
      };
      return map[county.rural_status] || '#94a3b8';
    }
    case 'appalachian':
      return county.appalachian_flag ? '#dc2626' : '#86efac';
    default:
      return '#94a3b8';
  }
}

function getFacilityIcon(type: Facility['type']): L.DivIcon {
  const colors: Record<string, string> = {
    PulmonaryHub: '#0ea5e9',
    FQHC: '#10b981',
    RHC: '#f59e0b',
    CAH: '#8b5cf6',
    Hospital: '#ef4444',
  };
  const color = colors[type] || '#6b7280';
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function MapLegend({ layer }: { layer: LayerType }) {
  const legendItems: { color: string; label: string }[] = [];

  if (layer === 'opportunity_score') {
    legendItems.push(
      { color: '#22c55e', label: 'Low (0-24)' },
      { color: '#eab308', label: 'Moderate (25-49)' },
      { color: '#f97316', label: 'High (50-74)' },
      { color: '#ef4444', label: 'Very High (75-100)' }
    );
  } else if (layer === 'asthma_prevalence') {
    legendItems.push(
      { color: '#dbeafe', label: '< 10%' },
      { color: '#93c5fd', label: '10-12%' },
      { color: '#3b82f6', label: '12-14%' },
      { color: '#1d4ed8', label: '14-16%' },
      { color: '#1e3a8a', label: '> 16%' }
    );
  } else if (layer === 'asthma_ed_rate') {
    legendItems.push(
      { color: '#fed7aa', label: '< 20/10k' },
      { color: '#fb923c', label: '20-28/10k' },
      { color: '#ea580c', label: '28-36/10k' },
      { color: '#c2410c', label: '36-44/10k' },
      { color: '#7c2d12', label: '> 44/10k' }
    );
  } else if (layer === 'rurality') {
    legendItems.push(
      { color: '#f1f5f9', label: 'Urban' },
      { color: '#94a3b8', label: 'Suburban' },
      { color: '#475569', label: 'Rural' },
      { color: '#1e293b', label: 'Highly Rural' }
    );
  } else if (layer === 'appalachian') {
    legendItems.push(
      { color: '#dc2626', label: 'Appalachian County' },
      { color: '#86efac', label: 'Non-Appalachian' }
    );
  }

  return (
    <div className="absolute bottom-6 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 text-xs">
      <div className="font-semibold text-slate-700 mb-2">Legend</div>
      {legendItems.map((item, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div
            className="w-4 h-4 rounded flex-shrink-0 border border-slate-300"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-slate-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function GeoJSONLayer({
  geojsonData,
  counties,
  activeLayer,
  selectedFips,
  onCountyClick,
}: {
  geojsonData: GeoJSON.FeatureCollection | null;
  counties: CountyMetrics[];
  activeLayer: LayerType;
  selectedFips: string | null;
  onCountyClick: (fips: string) => void;
}) {
  const countyMap = React.useMemo(() => {
    const m: Record<string, CountyMetrics> = {};
    counties.forEach(c => { m[c.county_fips] = c; });
    return m;
  }, [counties]);

  if (!geojsonData) return null;

  return (
    <GeoJSON
      key={activeLayer + selectedFips}
      data={geojsonData}
      style={(feature) => {
        if (!feature?.properties) return {};
        const fips = feature.properties.FIPS as string;
        const county = countyMap[fips];
        if (!county) return { fillColor: '#e2e8f0', weight: 1, fillOpacity: 0.7 };
        const isSelected = fips === selectedFips;
        return {
          fillColor: getLayerColor(county, activeLayer),
          weight: isSelected ? 3 : 1,
          color: isSelected ? '#0ea5e9' : '#ffffff',
          fillOpacity: isSelected ? 0.95 : 0.75,
        };
      }}
      onEachFeature={(feature, layer) => {
        if (!feature?.properties) return;
        const fips = feature.properties.FIPS as string;
        const county = countyMap[fips];
        if (!county) return;

        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({ weight: 2, fillOpacity: 0.9 });
            l.bindTooltip(
              `<div class="font-semibold">${county.county_name} County</div>
               <div>Opp. Score: <b>${county.opportunity_score}</b> (${county.opportunity_label})</div>
               <div>Asthma: ${county.adult_asthma_prevalence}%</div>
               <div>Rural: ${county.rural_status}</div>
               ${county.appalachian_flag ? '<div class="text-red-600">Appalachian</div>' : ''}`,
              { sticky: true }
            ).openTooltip();
          },
          mouseout: (e) => {
            const l = e.target;
            l.setStyle({
              weight: fips === selectedFips ? 3 : 1,
              fillOpacity: fips === selectedFips ? 0.95 : 0.75,
            });
            l.closeTooltip();
          },
          click: () => onCountyClick(fips),
        });
      }}
    />
  );
}

function MapController({ selectedFips, geojsonData }: { selectedFips: string | null; geojsonData: GeoJSON.FeatureCollection | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedFips && geojsonData) {
      const feature = geojsonData.features.find(
        f => f.properties?.FIPS === selectedFips
      );
      if (feature && feature.geometry.type === 'Polygon') {
        const coords = feature.geometry.coordinates[0];
        const lats = coords.map(c => c[1]);
        const lngs = coords.map(c => c[0]);
        const bounds = L.latLngBounds(
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)]
        );
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [selectedFips, geojsonData, map]);

  return null;
}

export default function OhioMap({
  counties,
  facilities,
  activeLayer,
  showFacilities,
  selectedFips,
  onCountyClick,
}: OhioMapProps) {
  const [geojsonData, setGeojsonData] = useState<GeoJSON.FeatureCollection | null>(null);
  const iconsFixed = useRef(false);

  useEffect(() => {
    if (!iconsFixed.current) {
      fixLeafletIcons();
      iconsFixed.current = true;
    }
  }, []);

  useEffect(() => {
    fetch('/ohio-counties.geojson')
      .then(res => res.json())
      .then(data => setGeojsonData(data))
      .catch(err => console.error('Failed to load GeoJSON:', err));
  }, []);

  const visibleFacilities = facilities.filter(f => {
    if (f.type === 'PulmonaryHub') return showFacilities.pulmonary_hubs;
    if (f.type === 'FQHC') return showFacilities.fqhc;
    if (f.type === 'RHC') return showFacilities.rhc;
    if (f.type === 'CAH') return showFacilities.cah;
    return false;
  });

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[40.4173, -82.9071]}
        zoom={7}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.3}
        />

        <GeoJSONLayer
          geojsonData={geojsonData}
          counties={counties}
          activeLayer={activeLayer}
          selectedFips={selectedFips}
          onCountyClick={onCountyClick}
        />

        <MapController selectedFips={selectedFips} geojsonData={geojsonData} />

        {visibleFacilities.map(f => (
          <Marker
            key={f.id}
            position={[f.lat, f.lng]}
            icon={getFacilityIcon(f.type)}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{f.name}</div>
                <div className="text-slate-500">{f.type} • {f.county} County</div>
                {f.affiliation && <div className="text-slate-500">{f.affiliation}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <MapLegend layer={activeLayer} />

      {/* Facility legend */}
      {Object.values(showFacilities).some(Boolean) && (
        <div className="absolute bottom-6 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 text-xs">
          <div className="font-semibold text-slate-700 mb-2">Facilities</div>
          {showFacilities.pulmonary_hubs && (
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-sky-500 border border-white" />
              <span>Pulmonary Hub</span>
            </div>
          )}
          {showFacilities.fqhc && (
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
              <span>FQHC</span>
            </div>
          )}
          {showFacilities.rhc && (
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-amber-500 border border-white" />
              <span>Rural Health Clinic</span>
            </div>
          )}
          {showFacilities.cah && (
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-violet-500 border border-white" />
              <span>Critical Access Hospital</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
