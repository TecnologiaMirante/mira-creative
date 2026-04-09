//src/components/reports/KpiCard.jsx

import { Card, CardContent } from "../ui/card";

export function KpiCard({ title, value, desc, icon: Icon, color, bg }) {
  return (
    <Card className="overflow-hidden border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(248,250,252,0.97))] shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              {title}
            </p>
            <div className="text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </div>
            {desc && <p className="text-sm text-slate-500">{desc}</p>}
          </div>

          <div className={`rounded-2xl p-3 shadow-sm ${bg}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
