'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle, BarChart2, Download } from 'lucide-react';
import { UploadedPatient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const SAMPLE_CSV = `county,patient_id,diagnosis,eos_count,feno,ocs_bursts,biologic_exposure,hospitalization,payer
Scioto,PT001,asthma,420,52,3,false,true,Medicaid
Lawrence,PT002,asthma,380,45,4,false,true,Medicaid
Meigs,PT003,asthma,310,38,2,false,false,Uninsured
Adams,PT004,asthma,280,28,3,false,false,Medicaid
Gallia,PT005,asthma,520,61,5,false,true,Medicaid
Vinton,PT006,asthma,190,22,2,false,false,Medicare
Athens,PT007,asthma,350,42,3,false,false,Medicaid
Jackson,PT008,copd,290,18,3,false,true,Medicare
Pike,PT009,asthma,440,55,4,false,true,Medicaid
Noble,PT010,asthma,230,30,2,false,false,Medicaid`;

function parseCSV(text: string): UploadedPatient[] {
  const lines = text.trim().split('\n');
  const header = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    header.forEach((h, i) => { row[h] = vals[i] || ''; });
    return {
      county: row.county,
      patient_id: row.patient_id,
      diagnosis: row.diagnosis,
      eos_count: row.eos_count ? parseInt(row.eos_count) : undefined,
      feno: row.feno ? parseInt(row.feno) : undefined,
      ocs_bursts: row.ocs_bursts ? parseInt(row.ocs_bursts) : undefined,
      biologic_exposure: row.biologic_exposure === 'true',
      hospitalization: row.hospitalization === 'true',
      payer: row.payer,
    };
  });
}

function analyzePatients(patients: UploadedPatient[]) {
  const countyMap: Record<string, { county: string; count: number; avgEos: number; highOcs: number; hospitalized: number; biologicExposed: number }> = {};

  patients.forEach(p => {
    if (!countyMap[p.county]) {
      countyMap[p.county] = { county: p.county, count: 0, avgEos: 0, highOcs: 0, hospitalized: 0, biologicExposed: 0 };
    }
    const c = countyMap[p.county];
    c.count++;
    if (p.eos_count) c.avgEos = (c.avgEos * (c.count - 1) + p.eos_count) / c.count;
    if ((p.ocs_bursts || 0) >= 2) c.highOcs++;
    if (p.hospitalization) c.hospitalized++;
    if (p.biologic_exposure) c.biologicExposed++;
  });

  return Object.values(countyMap).sort((a, b) => b.count - a.count);
}

export default function UploadPage() {
  const [patients, setPatients] = useState<UploadedPatient[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setError('No data rows found in CSV.');
          return;
        }
        setPatients(parsed);
        setError(null);
      } catch {
        setError('Failed to parse CSV. Check format and try again.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const loadSample = () => {
    const parsed = parseCSV(SAMPLE_CSV);
    setPatients(parsed);
    setError(null);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'farm-to-feno-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const analysis = patients ? analyzePatients(patients) : null;
  const highOcsTotal = patients ? patients.filter(p => (p.ocs_bursts || 0) >= 2).length : 0;
  const eosHighTotal = patients ? patients.filter(p => (p.eos_count || 0) >= 300).length : 0;
  const biologicGap = patients ? patients.filter(p => (p.eos_count || 0) >= 300 && !p.biologic_exposure).length : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Upload Patient Analytics</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Upload de-identified patient data to identify OCS burden pockets, biologic access gaps,
          and eosinophilic phenotype clusters by county.
        </p>
      </div>

      {/* What this does */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <InfoCard
          title="OCS Burden Analysis"
          desc="Identifies counties with high oral corticosteroid burst rates — a marker of uncontrolled asthma and biologic access gap."
          icon={<BarChart2 className="h-5 w-5 text-violet-600" />}
          bg="bg-violet-50"
        />
        <InfoCard
          title="Eosinophilic Phenotype"
          desc="Flags patients with eos ≥300 or FeNO ≥25 ppb who lack biologic exposure — a referral and therapy optimization opportunity."
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          bg="bg-amber-50"
        />
        <InfoCard
          title="County-Level Mapping"
          desc="Aggregates patient data by county to align with the opportunity score map and identify geographic care gaps."
          icon={<FileText className="h-5 w-5 text-sky-600" />}
          bg="bg-sky-50"
        />
      </div>

      {/* Upload zone */}
      {!patients && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                isDragging ? 'border-sky-400 bg-sky-50' : 'border-slate-300 hover:border-sky-300 hover:bg-slate-50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="font-semibold text-slate-700 mb-1">Drop CSV file here or click to browse</p>
              <p className="text-sm text-slate-500">
                De-identified patient data only. See schema below.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </div>

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <Button variant="outline" size="sm" onClick={loadSample}>
                Load Sample Data
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadSample}>
                <Download className="h-4 w-4 mr-2" />
                Download Sample CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSV Schema */}
      {!patients && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Expected CSV Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left pb-2 pr-4 font-semibold text-slate-700">Field</th>
                    <th className="text-left pb-2 pr-4 font-semibold text-slate-700">Type</th>
                    <th className="text-left pb-2 font-semibold text-slate-700">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['county', 'string', 'Ohio county name (e.g., Scioto)'],
                    ['patient_id', 'string', 'De-identified patient ID'],
                    ['diagnosis', 'string', 'asthma | copd | overlap | unknown'],
                    ['eos_count', 'number', 'Eosinophils in cells/mcL'],
                    ['feno', 'number', 'FeNO in ppb (optional)'],
                    ['ocs_bursts', 'number', 'OCS bursts in past 12 months'],
                    ['biologic_exposure', 'boolean', 'true | false'],
                    ['hospitalization', 'boolean', 'true | false'],
                    ['payer', 'string', 'Medicaid | Medicare | Commercial | Uninsured'],
                  ].map(([f, t, d]) => (
                    <tr key={f}>
                      <td className="py-1.5 pr-4 font-mono text-sky-700">{f}</td>
                      <td className="py-1.5 pr-4 text-slate-500">{t}</td>
                      <td className="py-1.5 text-slate-600">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis results */}
      {patients && analysis && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Analysis Results — {patients.length} patients
            </h2>
            <Button variant="outline" size="sm" onClick={() => setPatients(null)}>
              Upload New File
            </Button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard label="Total Patients" value={patients.length.toString()} color="text-slate-900" />
            <SummaryCard label="High OCS Burden (≥2)" value={highOcsTotal.toString()} color="text-orange-600" />
            <SummaryCard label="Eos ≥300 cells/mcL" value={eosHighTotal.toString()} color="text-sky-600" />
            <SummaryCard label="Biologic Access Gap" value={biologicGap.toString()} color="text-red-600" />
          </div>

          {/* County chart */}
          <Card>
            <CardHeader>
              <CardTitle>OCS Burden by County</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analysis} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="county" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="highOcs" name="High OCS (≥2 bursts)" fill="#f97316" radius={[3,3,0,0]} />
                  <Bar dataKey="hospitalized" name="Hospitalized" fill="#ef4444" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Patient table */}
          <Card>
            <CardHeader>
              <CardTitle>County-Level Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                      <th className="pb-2 text-left pr-4">County</th>
                      <th className="pb-2 text-right pr-4">Patients</th>
                      <th className="pb-2 text-right pr-4">Avg Eos</th>
                      <th className="pb-2 text-right pr-4">High OCS</th>
                      <th className="pb-2 text-right pr-4">Hospitalized</th>
                      <th className="pb-2 text-right">Biologic Gap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analysis.map(row => (
                      <tr key={row.county}>
                        <td className="py-2 pr-4 font-medium">{row.county}</td>
                        <td className="py-2 pr-4 text-right">{row.count}</td>
                        <td className="py-2 pr-4 text-right">{Math.round(row.avgEos)}</td>
                        <td className="py-2 pr-4 text-right">
                          <Badge variant={row.highOcs > 0 ? 'orange' : 'secondary'}>{row.highOcs}</Badge>
                        </td>
                        <td className="py-2 pr-4 text-right">
                          <Badge variant={row.hospitalized > 0 ? 'danger' : 'secondary'}>{row.hospitalized}</Badge>
                        </td>
                        <td className="py-2 text-right">
                          <Badge variant={row.count - row.biologicExposed > 0 ? 'warning' : 'success'}>
                            {row.count - row.biologicExposed}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              This analysis is for educational and population-health planning purposes only. Upload
              only de-identified data. Do not upload any PHI. Results are not a substitute for
              clinician judgment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, desc, icon, bg }: { title: string; desc: string; icon: React.ReactNode; bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-slate-200`}>
      <div className="mb-2">{icon}</div>
      <div className="font-semibold text-slate-800 text-sm mb-1">{title}</div>
      <div className="text-xs text-slate-600 leading-relaxed">{desc}</div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}
