// /components/dashboard/StatsGrid.js

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, TrendingUp } from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  borderColor,
  iconColor,
  footerText,
}) {
  return (
    <Card className={`border-l-4 ${borderColor}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {footerText && (
          <p className="text-xs text-muted-foreground">{footerText}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total de Roteiros"
        value={stats.total}
        icon={FileText}
        borderColor="border-primary"
        iconColor="text-primary"
      />
      <StatCard
        title="Em Produção"
        value={stats.emProducao}
        icon={Clock}
        borderColor="border-amber-500"
        iconColor="text-amber-500"
        footerText={`${
          stats.total > 0
            ? Math.round((stats.emProducao / stats.total) * 100)
            : 0
        }% do total`}
      />
      <StatCard
        title="Aprovados"
        value={stats.aprovados}
        icon={CheckCircle}
        borderColor="border-blue-500"
        iconColor="text-blue-500"
        footerText="Prontos para produção"
      />
      <StatCard
        title="Exibidos"
        value={stats.exibidos}
        icon={TrendingUp}
        borderColor="border-emerald-500"
        iconColor="text-emerald-500"
        footerText="Concluídos com sucesso"
      />
    </div>
  );
}
