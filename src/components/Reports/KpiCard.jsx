//src/components/reports/KpiCard.jsx

import { Card, CardContent } from "../ui/card";

// --- SUB-COMPONENTE DE CARD KPI (LIMPO) ---
export function KpiCard({ title, value, desc, icon: Icon, color, bg }) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <div className="text-3xl font-bold text-slate-900">{value}</div>
            {desc && <p className="text-xs text-slate-400 mt-1">{desc}</p>}
          </div>
          <div className={`p-3 rounded-xl ${bg}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
