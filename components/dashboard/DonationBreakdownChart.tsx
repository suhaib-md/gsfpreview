'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const DATA = [
  { name: 'Hadiya',  value: 60, color: '#004235' },
  { name: 'Zakat',   value: 25, color: '#8bd5bf' },
  { name: 'Other',   value: 15, color: '#cfe6f2' },
]

export default function DonationBreakdownChart() {
  return (
    <div className="bg-surface-lowest rounded-xl border border-outline-variant/20 shadow-sm p-5 overflow-hidden min-w-0">
      <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wide mb-4">
        Donation Breakdown
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={DATA}
            cx="50%"
            cy="50%"
            innerRadius={44}
            outerRadius={64}
            dataKey="value"
            strokeWidth={2}
            stroke="#f8f9fa"
          >
            {DATA.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val) => [`${val}%`, '']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #bec9c4' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-3">
        {DATA.map(d => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-on-surface-variant">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
