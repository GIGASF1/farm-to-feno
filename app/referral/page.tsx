'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Clock, FlaskConical, ChevronRight, ChevronLeft } from 'lucide-react';
import { computeReferral } from '@/lib/referral-engine';
import { ReferralInput, ReferralOutput } from '@/lib/types';
import { countyMetrics } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function ReferralForm() {
  const searchParams = useSearchParams();
  const defaultCounty = searchParams.get('county') || '';
  const defaultTravel = parseInt(searchParams.get('travel') || '60');

  const [step, setStep] = useState(1);
  const [result, setResult] = useState<ReferralOutput | null>(null);

  const [form, setForm] = useState<ReferralInput>({
    age_group: 'adult',
    diagnosis_suspected: 'asthma',
    eos: 200,
    feno: null,
    exacerbations_last_12mo: 2,
    ocs_bursts_last_12mo: 2,
    hospitalization_last_12mo: 0,
    ics_laba_status: 'ics_laba',
    smoking_status: 'never',
    county: defaultCounty,
    travel_time_to_specialty: defaultTravel,
    referral_source: '',
  });

  const update = (field: keyof ReferralInput, value: ReferralInput[keyof ReferralInput]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const output = computeReferral(form);
    setResult(output);
    setStep(3);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Referral Assessment Model</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Evidence-informed referral optimization for asthma and COPD patients in rural Ohio.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                step >= s ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`flex-1 h-1 rounded ${step > s ? 'bg-sky-600' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Patient Context */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Patient Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Age Group</Label>
                <Select value={form.age_group} onValueChange={v => update('age_group', v as ReferralInput['age_group'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adult">Adult (18+)</SelectItem>
                    <SelectItem value="pediatric">Pediatric (&lt;18)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Suspected Diagnosis</Label>
                <Select value={form.diagnosis_suspected} onValueChange={v => update('diagnosis_suspected', v as ReferralInput['diagnosis_suspected'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asthma">Asthma</SelectItem>
                    <SelectItem value="copd">COPD</SelectItem>
                    <SelectItem value="overlap">Asthma-COPD Overlap</SelectItem>
                    <SelectItem value="unknown">Unknown / Undifferentiated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">County</Label>
                <Select value={form.county} onValueChange={v => update('county', v)}>
                  <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                  <SelectContent>
                    {countyMetrics.map(c => (
                      <SelectItem key={c.county_fips} value={c.county_name}>
                        {c.county_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Travel Time to Specialty (minutes)</Label>
                <Input
                  type="number"
                  value={form.travel_time_to_specialty}
                  onChange={e => update('travel_time_to_specialty', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">Referring Provider / Source</Label>
              <Input
                placeholder="e.g., Rural Family Practice, FQHC"
                value={form.referral_source}
                onChange={e => update('referral_source', e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={() => setStep(2)}>
              Next: Clinical Markers
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Clinical Markers */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Clinical Markers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Eosinophil Count (cells/mcL)</Label>
                <Input
                  type="number"
                  value={form.eos}
                  onChange={e => update('eos', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 300"
                />
                <p className="text-xs text-slate-500 mt-1">Normal: &lt;100; Elevated: ≥150</p>
              </div>
              <div>
                <Label className="mb-1.5 block">FeNO (ppb) — leave blank if not done</Label>
                <Input
                  type="number"
                  value={form.feno ?? ''}
                  onChange={e => {
                    const val = e.target.value;
                    update('feno', val === '' ? null : parseInt(val));
                  }}
                  placeholder="e.g., 35 (leave blank if not done)"
                />
                <p className="text-xs text-slate-500 mt-1">Normal: &lt;25; Elevated: ≥25; High: ≥50</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1.5 block">Exacerbations (past 12 mo)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.exacerbations_last_12mo}
                  onChange={e => update('exacerbations_last_12mo', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">OCS Bursts (past 12 mo)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.ocs_bursts_last_12mo}
                  onChange={e => update('ocs_bursts_last_12mo', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Hospitalizations (past 12 mo)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.hospitalization_last_12mo}
                  onChange={e => update('hospitalization_last_12mo', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Current ICS/LABA Status</Label>
                <Select value={form.ics_laba_status} onValueChange={v => update('ics_laba_status', v as ReferralInput['ics_laba_status'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No controller therapy</SelectItem>
                    <SelectItem value="ics_only">ICS only</SelectItem>
                    <SelectItem value="ics_laba">ICS + LABA</SelectItem>
                    <SelectItem value="triple">Triple therapy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Smoking Status</Label>
                <Select value={form.smoking_status} onValueChange={v => update('smoking_status', v as ReferralInput['smoking_status'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="former">Former</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                Generate Referral Assessment
                <FlaskConical className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Results */}
      {step === 3 && result && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <ResultSummaryCard
              label="Phenotype"
              value={result.phenotype_likelihood.replace('-', ' ')}
              sub={`${result.phenotype_confidence} confidence`}
              color={
                result.phenotype_likelihood === 'eosinophilic'
                  ? 'border-sky-300 bg-sky-50'
                  : result.phenotype_likelihood === 'mixed'
                  ? 'border-violet-300 bg-violet-50'
                  : 'border-slate-300 bg-slate-50'
              }
            />
            <ResultSummaryCard
              label="Urgency"
              value={result.urgency.charAt(0).toUpperCase() + result.urgency.slice(1)}
              sub={result.urgency === 'urgent' ? 'Direct specialist contact' : result.urgency === 'expedited' ? 'Within 2-4 weeks' : 'Standard scheduling'}
              color={
                result.urgency === 'urgent'
                  ? 'border-red-300 bg-red-50'
                  : result.urgency === 'expedited'
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-green-300 bg-green-50'
              }
            />
            <ResultSummaryCard
              label="Biologic Candidacy"
              value={result.candidate_for_biologic_discussion ? 'Candidate' : 'Not indicated'}
              sub={result.candidate_for_advanced_review ? 'Advanced review recommended' : 'Routine review'}
              color={result.candidate_for_biologic_discussion ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-slate-50'}
            />
          </div>

          {/* Intervention types */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Interventions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.intervention_type.map((t, i) => (
                  <Badge key={i} variant="default" className="text-sm">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggested workup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-slate-400" />
                Suggested Workup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.suggested_workup.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-sky-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Referral packet */}
          <Card>
            <CardHeader>
              <CardTitle>Referral Packet Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.referral_packet_checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-0.5 accent-sky-600" readOnly />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Care coordination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                Care Coordination Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.care_coordination_notes.map((note, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-sky-500 font-bold flex-shrink-0">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">{result.disclaimer}</p>
          </div>

          <Button variant="outline" onClick={() => { setStep(1); setResult(null); }}>
            Start New Assessment
          </Button>
        </div>
      )}
    </div>
  );
}

function ResultSummaryCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border-2 p-4 ${color}`}>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-slate-900 capitalize">{value}</div>
      <div className="text-xs text-slate-600 mt-1">{sub}</div>
    </div>
  );
}

export default function ReferralPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
      <ReferralForm />
    </Suspense>
  );
}
