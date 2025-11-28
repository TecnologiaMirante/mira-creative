// /src/components/reports/ReportsPage.jsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "../../../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useUserCache } from "@/context/UserCacheContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  Filter,
  PieChart as PieIcon,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  isWithinInterval,
  parse,
} from "date-fns";
import { KpiCard } from "./KpiCard";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { CustomChartTooltip } from "./CustomChartTooltip";
import { CHART_COLORS, PROGRAM_COLORS_MAP } from "./util";

export function ReportsPage() {
  const [pautas, setPautas] = useState([]);
  const [programsMap, setProgramsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { getUserById, isLoadingCache } = useUserCache();

  // Filtros
  const [dateRange, setDateRange] = useState("30days");

  // --- BUSCA DE DADOS ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Programas
        const programsQuery = query(
          collection(db, "programas"),
          where("isVisible", "==", true)
        );
        const programsSnap = await getDocs(programsQuery);
        const progMap = {};
        programsSnap.docs.forEach((doc) => {
          progMap[doc.id] = doc.data().nome;
        });
        setProgramsMap(progMap);

        // 2. Pautas
        const pautasQuery = query(
          collection(db, "pautas"),
          where("isVisible", "==", true),
          orderBy("createdAt", "desc")
        );

        const pautasSnap = await getDocs(pautasQuery);
        const data = pautasSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAtDate: doc.data().createdAt?.toDate(),
        }));

        setPautas(data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- FILTRAGEM POR DATA ---
  const filteredPautas = useMemo(() => {
    if (dateRange === "all") return pautas;

    const now = new Date();
    let daysToSub = 30;
    if (dateRange === "7days") daysToSub = 7;
    if (dateRange === "90days") daysToSub = 90;

    const startDate = startOfDay(subDays(now, daysToSub));
    const endDate = endOfDay(now);

    return pautas.filter((p) => {
      if (!p.createdAtDate) return false;
      return isWithinInterval(p.createdAtDate, {
        start: startDate,
        end: endDate,
      });
    });
  }, [pautas, dateRange]);

  // --- CÁLCULO DE KPI'S ---
  const stats = useMemo(() => {
    const total = filteredPautas.length;
    const aprovados = filteredPautas.filter(
      (p) => p.status === "Aprovado" || p.status === "Exibido"
    ).length;
    const cancelados = filteredPautas.filter(
      (p) => p.status === "Cancelado"
    ).length;
    const approvalRate = total > 0 ? ((aprovados / total) * 100).toFixed(1) : 0;

    return { total, aprovados, cancelados, approvalRate };
  }, [filteredPautas]);

  // --- PREPARAÇÃO DOS GRÁFICOS ---
  // 1. Status
  const statusChartData = useMemo(() => {
    const counts = {};
    filteredPautas.forEach((p) => {
      const status = p.status || "Indefinido";
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredPautas]);

  // 2. Programas
  const programChartData = useMemo(() => {
    let countDaqui = 0;
    let countEspecial = 0;

    Object.values(programsMap).forEach((nomePrograma) => {
      const upperName = nomePrograma.trim().toUpperCase();

      if (upperName.includes("DAQUI")) {
        countDaqui++;
      } else if (upperName.includes("ESPECIAL")) {
        countEspecial++;
      }
    });

    return [
      { name: "Daqui", value: countDaqui },
      { name: "Especial", value: countEspecial },
    ]
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [programsMap]);

  // 3. Top Produtores
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
        return {
          name: fullName.split(" ")[0], // Primeiro nome para o eixo X
          fullName: fullName, // Nome completo para o tooltip
          value,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredPautas, isLoadingCache, getUserById]);

  // 4. Timeline
  const timelineChartData = useMemo(() => {
    const counts = {};
    filteredPautas.forEach((p) => {
      if (p.createdAtDate) {
        const dateStr = format(p.createdAtDate, "dd/MM");
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => {
        const dateA = parse(a.date, "dd/MM", new Date());
        const dateB = parse(b.date, "dd/MM", new Date());
        return dateA - dateB;
      });
  }, [filteredPautas]);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="p-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center ">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Visão geral de performance e produção
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px] border-0 shadow-none focus:ring-0 h-8 text-sm font-medium">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="90days">Últimos 3 meses</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Total de Pautas"
          value={stats.total}
          desc="No período selecionado"
          icon={BarChart3}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <KpiCard
          title="Taxa de Aprovação"
          value={`${stats.approvalRate}%`}
          desc="Pautas aprovadas ou exibidas"
          icon={CheckCircle2}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <KpiCard
          title="Cancelamentos"
          value={stats.cancelados}
          desc="Pautas canceladas"
          icon={XCircle}
          color="text-rose-600"
          bg="bg-rose-50"
        />
      </div>
      {/* CHARTS SECTION 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STATUS CHART */}
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" /> Status das
              Pautas
            </CardTitle>
            <CardDescription>
              Distribuição atual por etapa do fluxo
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusChartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  stroke="#64748b"
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  stroke="#64748b"
                />
                <Tooltip
                  content={<CustomChartTooltip />}
                  cursor={{ fill: "#f8fafc" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry, index) => (
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
          </CardContent>
        </Card>
        {/* PROGRAM CHART */}
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-slate-400" /> Daqui x Especiais
            </CardTitle>
            <CardDescription>Estrutura de Programação </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {programChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={programChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {programChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          PROGRAM_COLORS_MAP[entry.name] || CHART_COLORS.slate
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                <PieIcon className="h-8 w-8 opacity-20" />
                <p>Nenhum dado no período</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* CHARTS SECTION 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PRODUCER CHART */}
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Top Produtores
            </CardTitle>
            <CardDescription>
              Membros com maior volume de pautas
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={producerChartData}
                layout="vertical"
                margin={{ left: 0, right: 30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  stroke="#64748b"
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-slate-100 p-3 rounded-lg shadow-xl">
                          <p className="font-bold text-slate-800">
                            {payload[0].payload.fullName}
                          </p>
                          <p className="text-xs text-slate-500">
                            Pautas: {payload[0].value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={CHART_COLORS.secondary}
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* TIMELINE CHART */}
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Evolução Temporal
            </CardTitle>
            <CardDescription>
              Volume de criação de pautas por dia
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineChartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPautas" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={CHART_COLORS.info}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_COLORS.info}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  stroke="#64748b"
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  stroke="#64748b"
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Pautas"
                  stroke={CHART_COLORS.info}
                  fillOpacity={1}
                  fill="url(#colorPautas)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* CITY TABLE */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-semibold">
            Detalhamento Geográfico
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80">
              <tr>
                <th className="px-6 py-3 font-medium">Cidade</th>
                <th className="px-6 py-3 font-medium">Volume</th>
                <th className="px-6 py-3 font-medium">Participação</th>
                <th className="px-6 py-3 font-medium w-1/3">Visualização</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(
                filteredPautas.reduce((acc, curr) => {
                  const city = curr.cidade || "Não informado";
                  acc[city] = (acc[city] || 0) + 1;
                  return acc;
                }, {})
              )
                .sort((a, b) => b[1] - a[1])
                .map(([city, count], i) => {
                  const percent =
                    stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <tr
                      key={i}
                      className="bg-white hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-slate-700">
                        {city}
                      </td>
                      <td className="px-6 py-3 text-slate-600">{count}</td>
                      <td className="px-6 py-3 text-slate-500">
                        {percent.toFixed(1)}%
                      </td>
                      <td className="px-6 py-3">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
