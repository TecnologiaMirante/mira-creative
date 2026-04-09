import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import Select from "react-select";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  CheckCircle2,
  Filter,
  Layers3,
  PieChart as PieIcon,
  RotateCcw,
  Search,
  Sparkles,
  TrendingUp,
  Tv,
  XCircle,
} from "lucide-react";
import { endOfDay, format, isWithinInterval, parse, startOfDay, subDays } from "date-fns";

import { db } from "../../../firebaseClient";
import { useUserCache } from "@/context/UserCacheContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KpiCard } from "./KpiCard";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { CustomChartTooltip } from "./CustomChartTooltip";
import { CHART_COLORS, PROGRAM_COLORS_MAP } from "./util";
import { normalizeText } from "@/lib/utils";
import { selectPortalTarget, selectStyles } from "@/lib/selectStyles";

function ChartCard({ title, description, icon: Icon, children }) {
  return (
    <Card className="overflow-hidden border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(248,250,252,0.97))] shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)]">
      <CardHeader className="border-b border-slate-200/70 bg-white/70">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          {Icon && <Icon className="h-4 w-4 text-slate-400" />}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px] p-5">{children}</CardContent>
    </Card>
  );
}

const scopeOptions = [
  { value: "all", label: "Tudo" },
  { value: "pautas", label: "Pautas" },
  { value: "programas", label: "Programas" },
];
const dateRangeOptions = [
  { value: "7days", label: "Últimos 7 dias" },
  { value: "30days", label: "Últimos 30 dias" },
  { value: "90days", label: "Últimos 3 meses" },
  { value: "all", label: "Todo o período" },
];
const statusOptions = [
  { value: "all", label: "Todos os Status" },
  { value: "Aprovado", label: "Aprovado" },
  { value: "Cancelado", label: "Cancelado" },
  { value: "Em Produção", label: "Em Produção" },
  { value: "Em Revisão", label: "Em Revisão" },
  { value: "Exibido", label: "Exibido" },
];
const programOptions = [
  { value: "all", label: "Todos os Programas" },
  { value: "Daqui", label: "Daqui" },
  { value: "Especial", label: "Especial" },
];
const defaultFilters = {
  scope: "all",
  dateRange: "30days",
  status: "all",
  program: "all",
  cidade: "all",
  produtorId: "all",
  apresentadorId: "all",
  roteiristaId: "all",
  query: "",
};

export function ReportsPage() {
  const [pautas, setPautas] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [programsMap, setProgramsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const { getUserById, isLoadingCache, userCache } = useUserCache();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const programsQuery = query(collection(db, "programas"), where("isVisible", "==", true));
        const programsSnap = await getDocs(programsQuery);
        const programsData = programsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dataExibicaoDate: doc.data().dataExibicao?.toDate?.() || null,
        }));
        const progMap = {};
        programsData.forEach((programa) => {
          progMap[programa.id] = programa.nome;
        });

        const pautasQuery = query(
          collection(db, "pautas"),
          where("isVisible", "==", true),
          orderBy("createdAt", "desc")
        );
        const pautasSnap = await getDocs(pautasQuery);
        const pautasData = pautasSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAtDate: doc.data().createdAt?.toDate?.() || null,
        }));

        setProgramsMap(progMap);
        setProgramas(programsData);
        setPautas(pautasData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const userOptions = useMemo(() => {
    if (isLoadingCache || !userCache) return [];
    return [...userCache.values()]
      .map((user) => ({ value: user.uid, label: user.display_name }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [isLoadingCache, userCache]);

  const cidadeOptions = useMemo(() => {
    const cidades = [...new Set(pautas.map((pauta) => pauta.cidade).filter(Boolean))]
      .map((cidade) => ({ value: cidade, label: cidade }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    return [{ value: "all", label: "Todas as Cidades" }, ...cidades];
  }, [pautas]);

  const withinDateRange = (date) => {
    if (filters.dateRange === "all") return true;
    if (!date) return false;
    let daysToSub = 30;
    if (filters.dateRange === "7days") daysToSub = 7;
    if (filters.dateRange === "90days") daysToSub = 90;
    return isWithinInterval(date, {
      start: startOfDay(subDays(new Date(), daysToSub)),
      end: endOfDay(new Date()),
    });
  };

  const filteredPautas = useMemo(
    () =>
      pautas.filter((pauta) => {
        if (!withinDateRange(pauta.createdAtDate)) return false;
        if (filters.status !== "all" && normalizeText(pauta.status) !== normalizeText(filters.status)) return false;
        if (filters.program !== "all") {
          const programaNome = programsMap[pauta.programaId] || pauta.program || "";
          if (!normalizeText(programaNome).includes(normalizeText(filters.program))) return false;
        }
        if (filters.cidade !== "all" && normalizeText(pauta.cidade) !== normalizeText(filters.cidade)) return false;
        if (filters.produtorId !== "all" && pauta.produtorId !== filters.produtorId) return false;
        if (filters.apresentadorId !== "all" && pauta.apresentadorId !== filters.apresentadorId) return false;
        if (filters.roteiristaId !== "all" && pauta.roteiristaId !== filters.roteiristaId) return false;
        if (filters.query.trim()) {
          const haystack = [
            pauta.titulo,
            pauta.status,
            pauta.cidade,
            pauta.bairro,
            getUserById(pauta.produtorId)?.display_name,
            getUserById(pauta.apresentadorId)?.display_name,
            getUserById(pauta.roteiristaId)?.display_name,
          ]
            .filter(Boolean)
            .join(" ");
          if (!normalizeText(haystack).includes(normalizeText(filters.query))) return false;
        }
        return true;
      }),
    [filters, getUserById, pautas, programsMap]
  );

  const filteredProgramas = useMemo(
    () =>
      programas.filter((programa) => {
        if (!withinDateRange(programa.dataExibicaoDate)) return false;
        if (filters.status !== "all" && normalizeText(programa.status) !== normalizeText(filters.status)) return false;
        if (filters.program !== "all" && !normalizeText(programa.nome).includes(normalizeText(filters.program))) return false;
        if (filters.query.trim()) {
          const haystack = [programa.nome, programa.status, programa.lastEditedByName]
            .filter(Boolean)
            .join(" ");
          if (!normalizeText(haystack).includes(normalizeText(filters.query))) return false;
        }
        return true;
      }),
    [filters, programas]
  );

  const activeFiltersCount = useMemo(
    () =>
      [
        filters.scope,
        filters.dateRange,
        filters.status,
        filters.program,
        filters.cidade,
        filters.produtorId,
        filters.apresentadorId,
        filters.roteiristaId,
        filters.query.trim(),
      ].filter((value) => value && value !== "all" && value !== "30days").length,
    [filters]
  );

  const pautaStats = useMemo(() => {
    const total = filteredPautas.length;
    const aprovados = filteredPautas.filter((p) => p.status === "Aprovado" || p.status === "Exibido").length;
    const cancelados = filteredPautas.filter((p) => p.status === "Cancelado").length;
    const approvalRate = total > 0 ? ((aprovados / total) * 100).toFixed(1) : 0;
    return { total, aprovados, cancelados, approvalRate };
  }, [filteredPautas]);

  const programaStats = useMemo(() => {
    const total = filteredProgramas.length;
    const ativos = filteredProgramas.filter((p) =>
      ["Aprovado", "Em Produção", "Em Revisão"].includes(p.status)
    ).length;
    const exibidos = filteredProgramas.filter((p) => p.status === "Exibido").length;
    const approvalRate = total > 0 ? (((ativos + exibidos) / total) * 100).toFixed(1) : 0;
    return { total, ativos, exibidos, approvalRate };
  }, [filteredProgramas]);

  const combinedStatusChartData = useMemo(() => {
    const source =
      filters.scope === "programas"
        ? filteredProgramas
        : filters.scope === "pautas"
          ? filteredPautas
          : [...filteredPautas, ...filteredProgramas];
    const counts = {};
    source.forEach((item) => {
      const status = item.status || "Indefinido";
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredPautas, filteredProgramas, filters.scope]);

  const programFamilyChartData = useMemo(() => {
    const source =
      filters.scope === "pautas"
        ? filteredPautas.map((pauta) => ({ nome: programsMap[pauta.programaId] || pauta.program || "" }))
        : filteredProgramas;
    let countDaqui = 0;
    let countEspecial = 0;
    source.forEach((item) => {
      const nome = normalizeText(item.nome);
      if (nome.includes("daqui")) countDaqui++;
      else if (nome.includes("especial")) countEspecial++;
    });
    return [
      { name: "Daqui", value: countDaqui },
      { name: "Especial", value: countEspecial },
    ].filter((item) => item.value > 0);
  }, [filteredPautas, filteredProgramas, filters.scope, programsMap]);

  const scopeBreakdownData = useMemo(
    () =>
      [
        { name: "Pautas", value: filteredPautas.length },
        { name: "Programas", value: filteredProgramas.length },
      ].filter((item) => item.value > 0),
    [filteredPautas.length, filteredProgramas.length]
  );

  const producerChartData = useMemo(() => {
    if (isLoadingCache) return [];
    const counts = {};
    filteredPautas.forEach((p) => {
      if (p.produtorId) counts[p.produtorId] = (counts[p.produtorId] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([id, value]) => {
        const user = getUserById(id);
        const fullName = user ? user.display_name || user.nome : "Desconhecido";
        return { name: fullName.split(" ")[0], fullName, value };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredPautas, getUserById, isLoadingCache]);

  const timelineChartData = useMemo(() => {
    const counts = {};
    const source =
      filters.scope === "programas"
        ? filteredProgramas.map((item) => item.dataExibicaoDate)
        : filters.scope === "pautas"
          ? filteredPautas.map((item) => item.createdAtDate)
          : [
              ...filteredPautas.map((item) => item.createdAtDate),
              ...filteredProgramas.map((item) => item.dataExibicaoDate),
            ];
    source.forEach((date) => {
      if (!date) return;
      const dateStr = format(date, "dd/MM");
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => parse(a.date, "dd/MM", new Date()) - parse(b.date, "dd/MM", new Date()));
  }, [filteredPautas, filteredProgramas, filters.scope]);

  const cityRows = useMemo(
    () =>
      Object.entries(
        filteredPautas.reduce((acc, curr) => {
          const city = curr.cidade || "Não informado";
          acc[city] = (acc[city] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1]),
    [filteredPautas]
  );

  const scopeCards = useMemo(() => {
    if (filters.scope === "programas") {
      return [
        { title: "Programas", value: programaStats.total, desc: "No recorte selecionado", icon: Tv, color: "text-indigo-600", bg: "bg-indigo-50" },
        { title: "Ativos", value: programaStats.ativos, desc: "Em andamento ou aprovados", icon: Layers3, color: "text-cyan-600", bg: "bg-cyan-50" },
        { title: "Exibidos", value: programaStats.exibidos, desc: "Concluídos na grade", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Saúde geral", value: `${programaStats.approvalRate}%`, desc: "Fluxos em estado positivo", icon: TrendingUp, color: "text-fuchsia-600", bg: "bg-fuchsia-50" },
      ];
    }
    if (filters.scope === "pautas") {
      return [
        { title: "Pautas", value: pautaStats.total, desc: "No recorte selecionado", icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
        { title: "Aprovadas", value: pautaStats.aprovados, desc: "Aprovadas ou exibidas", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Canceladas", value: pautaStats.cancelados, desc: "Ocorrências no período", icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
        { title: "Taxa de aprovação", value: `${pautaStats.approvalRate}%`, desc: "Aprovadas no recorte", icon: TrendingUp, color: "text-fuchsia-600", bg: "bg-fuchsia-50" },
      ];
    }
    const totalGeral = filteredPautas.length + filteredProgramas.length;
    const positivos = pautaStats.aprovados + programaStats.ativos + programaStats.exibidos;
    const taxaGeral = totalGeral > 0 ? ((positivos / totalGeral) * 100).toFixed(1) : 0;
    return [
      { title: "Registros", value: totalGeral, desc: "Programas e pautas no recorte", icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
      { title: "Programas", value: filteredProgramas.length, desc: "Fluxos de grade filtrados", icon: Tv, color: "text-cyan-600", bg: "bg-cyan-50" },
      { title: "Pautas", value: filteredPautas.length, desc: "Operação editorial filtrada", icon: Layers3, color: "text-emerald-600", bg: "bg-emerald-50" },
      { title: "Saúde geral", value: `${taxaGeral}%`, desc: "Itens em estado positivo", icon: TrendingUp, color: "text-fuchsia-600", bg: "bg-fuchsia-50" },
    ];
  }, [filters.scope, filteredPautas.length, filteredProgramas.length, pautaStats, programaStats]);

  const clearFilters = () => setFilters(defaultFilters);
  const showPautaSpecificFilters = filters.scope !== "programas";

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(248,250,252,0.97))] p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-700">
              <BarChart3 className="h-3.5 w-3.5" />
              Intelligence
            </span>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
              <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
                Cruze filtros de operação e grade para enxergar o sistema com o mesmo contexto das telas de Programas e Pautas.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Panorama atual</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{activeFiltersCount} filtros ativos</p>
          </div>
        </div>
      </div>

      <Card className="rounded-[28px] border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)]">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Filter className="h-4 w-4 text-indigo-500" />
            Filtros analíticos
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
              Escopo: {scopeOptions.find((item) => item.value === filters.scope)?.label}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
              Período: {dateRangeOptions.find((item) => item.value === filters.dateRange)?.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>Tipo de dado</Label>
            <Select options={scopeOptions} value={scopeOptions.find((item) => item.value === filters.scope)} onChange={(opt) => setFilters((prev) => ({ ...prev, scope: opt?.value || "all" }))} styles={selectStyles} menuPortalTarget={selectPortalTarget} menuPosition="fixed" />
          </div>
          <div className="space-y-2">
            <Label>Período</Label>
            <Select options={dateRangeOptions} value={dateRangeOptions.find((item) => item.value === filters.dateRange)} onChange={(opt) => setFilters((prev) => ({ ...prev, dateRange: opt?.value || "30days" }))} styles={selectStyles} menuPortalTarget={selectPortalTarget} menuPosition="fixed" />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select options={statusOptions} value={statusOptions.find((item) => item.value === filters.status)} onChange={(opt) => setFilters((prev) => ({ ...prev, status: opt?.value || "all" }))} styles={selectStyles} menuPortalTarget={selectPortalTarget} menuPosition="fixed" />
          </div>
          <div className="space-y-2">
            <Label>Programa</Label>
            <Select options={programOptions} value={programOptions.find((item) => item.value === filters.program)} onChange={(opt) => setFilters((prev) => ({ ...prev, program: opt?.value || "all" }))} styles={selectStyles} menuPortalTarget={selectPortalTarget} menuPosition="fixed" />
          </div>

          <div className="space-y-2 md:col-span-2 xl:col-span-2">
            <Label>Busca rápida</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={filters.query} onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))} placeholder="Busque por título, cidade, status, editor ou equipe" className="h-11 rounded-2xl border-white/70 bg-white/85 pl-10 shadow-[0_14px_26px_-24px_rgba(15,23,42,0.45)]" />
            </div>
          </div>

          {showPautaSpecificFilters && (
            <>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Select options={cidadeOptions} value={cidadeOptions.find((item) => item.value === filters.cidade)} onChange={(opt) => setFilters((prev) => ({ ...prev, cidade: opt?.value || "all" }))} styles={selectStyles} menuPortalTarget={selectPortalTarget} menuPosition="fixed" />
              </div>
              <div className="space-y-2">
                <Label>Produtor</Label>
                <Select options={[{ value: "all", label: "Todos os Produtores" }, ...userOptions]} value={[{ value: "all", label: "Todos os Produtores" }, ...userOptions].find((item) => item.value === filters.produtorId)} onChange={(opt) => setFilters((prev) => ({ ...prev, produtorId: opt?.value || "all" }))} styles={selectStyles} menuPortalTarget={selectPortalTarget} menuPosition="fixed" />
              </div>
              <div className="space-y-2">
                <Label>Apresentador</Label>
                <Select options={[{ value: "all", label: "Todos os Apresentadores" }, ...userOptions]} value={[{ value: "all", label: "Todos os Apresentadores" }, ...userOptions].find((item) => item.value === filters.apresentadorId)} onChange={(opt) => setFilters((prev) => ({ ...prev, apresentadorId: opt?.value || "all" }))} styles={selectStyles} menuPortalTarget={selectPortalTarget} menuPosition="fixed" />
              </div>
              <div className="space-y-2">
                <Label>Roteirista</Label>
                <Select options={[{ value: "all", label: "Todos os Roteiristas" }, ...userOptions]} value={[{ value: "all", label: "Todos os Roteiristas" }, ...userOptions].find((item) => item.value === filters.roteiristaId)} onChange={(opt) => setFilters((prev) => ({ ...prev, roteiristaId: opt?.value || "all" }))} styles={selectStyles} menuPortalTarget={selectPortalTarget} menuPosition="fixed" />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 text-cyan-500" />
            Você pode combinar escopo, equipe, cidade e programa para descobrir gargalos e padrões mais rápido.
          </p>
          <Button variant="outline" className="gap-2" onClick={clearFilters}>
            <RotateCcw className="h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scopeCards.map((card) => <KpiCard key={card.title} {...card} />)}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Status dos itens" description="Distribuição do recorte por etapa do fluxo" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={combinedStatusChartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
              <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
              <Tooltip content={<CustomChartTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {combinedStatusChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === "Aprovado"
                        ? CHART_COLORS.success
                        : entry.name === "Cancelado"
                          ? CHART_COLORS.danger
                          : entry.name === "Em Produção"
                            ? CHART_COLORS.warning
                            : CHART_COLORS.primary
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={filters.scope === "all" ? "Composição do recorte" : "Família de programas"}
          description={filters.scope === "all" ? "Separação entre programas e pautas filtrados" : "Distribuição entre Daqui e Especiais"}
          icon={PieIcon}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filters.scope === "all" ? scopeBreakdownData : programFamilyChartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={92}
                paddingAngle={4}
                dataKey="value"
              >
                {(filters.scope === "all" ? scopeBreakdownData : programFamilyChartData).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      filters.scope === "all"
                        ? index === 0
                          ? CHART_COLORS.primary
                          : CHART_COLORS.secondary
                        : PROGRAM_COLORS_MAP[entry.name] || CHART_COLORS.slate
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomChartTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard
          title={filters.scope === "programas" ? "Família de programas" : "Top produtores"}
          description={filters.scope === "programas" ? "Distribuição da grade filtrada" : "Membros com maior volume de pautas"}
          icon={filters.scope === "programas" ? Tv : Layers3}
        >
          {filters.scope === "programas" ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={programFamilyChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={92} paddingAngle={4} dataKey="value">
                  {programFamilyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PROGRAM_COLORS_MAP[entry.name] || CHART_COLORS.slate} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={producerChartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={90} axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                          <p className="font-semibold text-slate-800">{payload[0].payload.fullName}</p>
                          <p className="text-xs text-slate-500">Itens: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" fill={CHART_COLORS.secondary} radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Evolução temporal" description="Volume de itens ao longo do tempo no recorte" icon={BarChart3}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDashboardTimeline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.info} stopOpacity={0.32} />
                  <stop offset="95%" stopColor={CHART_COLORS.info} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
              <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
              <Tooltip content={<CustomChartTooltip />} />
              <Area type="monotone" dataKey="value" name="Itens" stroke={CHART_COLORS.info} fillOpacity={1} fill="url(#colorDashboardTimeline)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {showPautaSpecificFilters && (
        <Card className="overflow-hidden border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(248,250,252,0.97))] shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)]">
          <CardHeader className="border-b border-slate-200/70 bg-white/70">
            <CardTitle className="text-lg font-semibold text-slate-900">Detalhamento geográfico</CardTitle>
            <CardDescription>Distribuição das pautas por cidade dentro dos filtros aplicados</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Cidade</th>
                  <th className="px-6 py-4 font-medium">Volume</th>
                  <th className="px-6 py-4 font-medium">Participação</th>
                  <th className="px-6 py-4 font-medium">Visualização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cityRows.map(([city, count], i) => {
                  const percent = filteredPautas.length > 0 ? (count / filteredPautas.length) * 100 : 0;
                  return (
                    <tr key={i} className="bg-white/70 transition-colors hover:bg-slate-50/90">
                      <td className="px-6 py-4 font-medium text-slate-700">{city}</td>
                      <td className="px-6 py-4 text-slate-600">{count}</td>
                      <td className="px-6 py-4 text-slate-500">{percent.toFixed(1)}%</td>
                      <td className="px-6 py-4">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${percent}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
