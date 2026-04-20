'use client'

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts'

const DATA = [
  { month: 'Sep', value: 60 },
  { month: 'Oct', value: 75 },
  { month: 'Nov', value: 85 },
  { month: 'Dec', value: 92 },
]

export default function CollectionRateChart() {
  return (
    <div className="bg-surface-lowest rounded-xl border border-outline-variant/20 shadow-sm p-5">
      <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wide mb-4">
        Collection Rate
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={DATA} barSize={32} margin={{ top: 18, right: 4, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#6f7975' }}
          />
          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#6f7975' }}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip
            formatter={(val) => [`${val}%`, 'Collection Rate']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #bec9c4' }}
            cursor={{ fill: '#edeeef' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="value"
              position="top"
              formatter={(v: unknown) => `${v}%`}
              style={{ fontSize: 10, fill: '#3f4945', fontWeight: 600 }}
            />
            {DATA.map((_, i) => (
              <Cell
                key={i}
                fill={i === DATA.length - 1 ? '#004235' : '#8bd5bf'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
