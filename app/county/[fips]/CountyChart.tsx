'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  metric: string;
  county: number;
  state: number;
  unit: string;
}

interface CountyChartProps {
  data: ChartDataPoint[];
  countyName: string;
}

export default function CountyChart({ data, countyName }: CountyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value, name) => {
            const v = typeof value === 'number' ? value.toFixed(1) : String(value);
            const label = name === 'county' ? countyName : 'Ohio Avg';
            return [v, label];
          }}
        />
        <Legend formatter={(value) => (value === 'county' ? countyName : 'Ohio Avg')} />
        <Bar dataKey="county" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
        <Bar dataKey="state" fill="#94a3b8" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
