import { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { deletePauta, getPautas } from "../../../firebaseClient";
import { getProgramas } from "../../../firebaseClient";
import { LoadingOverlay } from "../LoadingOverlay";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Plus,
  Search,
  ListFilter,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PautaCardGrid } from "./PautaCardGrid";
import { useUserCache } from "@/context/UserCacheContext";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import UserContext from "@/context/UserContext";
import { selectPortalTarget, selectStyles } from "@/lib/selectStyles";
import { normalizeText } from "@/lib/utils";

const statusOptions = [
  { value: "all", label: "Todos os Status" },
  { value: "Aprovado", label: "Aprovado" },
  { value: "Cancelado", label: "Cancelado" },
  { value: "Em Produção", label: "Em Produção" },
  { value: "Em Revisão", label: "Em Revisão" },
  { value: "Exibido", label: "Exibido" },
];

const programsOptions = [
  { value: "all", label: "Todos os Programas" },
  { value: "Daqui", label: "Daqui" },
  { value: "Especial", label: "Especial" },
];

const sortOptions = [
  { value: "recent", label: "Mais recentes" },
  { value: "title-asc", label: "Título A-Z" },
  { value: "title-desc", label: "Título Z-A" },
  { value: "status", label: "Por status" },
  { value: "city", label: "Por cidade" },
];

const SummaryCard = ({ label, value, hint, accentClasses }) => (
  <Card className="rounded-[22px] border-white/70 bg-white/82 p-5">
    <div className="space-y-1">
      <p
        className={`text-xs font-semibold uppercase tracking-[0.22em] ${accentClasses}`}
      >
        {label}
      </p>
      <p className="text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="text-sm text-slate-500">{hint}</p>
    </div>
  </Card>
);

export function PautasListPage() {
  const { user } = useContext(UserContext);

  const [allPautas, setAllPautas] = useState([]);
  const [programasMap, setProgramasMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { userCache, isLoadingCache } = useUserCache();

  const [filters, setFilters] = useState({
    status: "all",
    produtorId: "all",
    apresentadorId: "all",
    roteiristaId: "all",
    program: "all",
    cidade: "all",
    query: "",
    sortBy: "recent",
  });

  const userOptions = useMemo(() => {
    if (isLoadingCache || !userCache) return [];
    return [...userCache.values()]
      .map((cachedUser) => ({
        value: cachedUser.uid,
        label: cachedUser.display_name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [userCache, isLoadingCache]);

  const cidadeOptions = useMemo(() => {
    const cidadesUnicas = [
      ...new Set(allPautas.map((p) => p.cidade).filter(Boolean)),
    ];
    const options = cidadesUnicas
      .map((cidade) => ({ value: cidade, label: cidade }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    return [{ value: "all", label: "Todas as Cidades" }, ...options];
  }, [allPautas]);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = getPautas((novasPautas) => {
      setAllPautas(novasPautas);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = getProgramas((novosProgramas) => {
      const map = {};
      novosProgramas.forEach((programa) => {
        map[programa.id] = programa.nome;
      });
      setProgramasMap(map);
    });
    return () => unsubscribe();
  }, []);

  const filteredPautas = useMemo(() => {
    const filtered = allPautas.filter((pauta) => {
      if (
        filters.status !== "all" &&
        normalizeText(pauta.status) !== normalizeText(filters.status)
      ) {
        return false;
      }
      if (
        filters.produtorId !== "all" &&
        pauta.produtorId !== filters.produtorId
      ) {
        return false;
      }
      if (
        filters.apresentadorId !== "all" &&
        pauta.apresentadorId !== filters.apresentadorId
      ) {
        return false;
      }
      if (
        filters.roteiristaId !== "all" &&
        pauta.roteiristaId !== filters.roteiristaId
      ) {
        return false;
      }
      if (filters.program !== "all") {
        const programaNome = programasMap[pauta.programaId] || "";
        if (
          !normalizeText(programaNome).includes(normalizeText(filters.program))
        ) {
          return false;
        }
      }
      if (
        filters.cidade !== "all" &&
        normalizeText(pauta.cidade) !== normalizeText(filters.cidade)
      ) {
        return false;
      }

      if (filters.query.trim()) {
        const haystack = [
          pauta.titulo,
          pauta.cidade,
          pauta.bairro,
          pauta.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!normalizeText(haystack).includes(normalizeText(filters.query))) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...filtered];
    switch (filters.sortBy) {
      case "title-asc":
        sorted.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));
        break;
      case "title-desc":
        sorted.sort((a, b) => (b.titulo || "").localeCompare(a.titulo || ""));
        break;
      case "status":
        sorted.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
        break;
      case "city":
        sorted.sort((a, b) => (a.cidade || "").localeCompare(b.cidade || ""));
        break;
      default:
        sorted.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
    }

    return sorted;
  }, [allPautas, filters]);

  const summary = useMemo(() => {
    const total = allPautas.length;
    const comRoteiro = allPautas.filter((item) => item.roteiroId).length;
    const emProducao = allPautas.filter(
      (item) => item.status === "Em Produção",
    ).length;
    const cidades = new Set(
      allPautas.map((item) => item.cidade).filter(Boolean),
    ).size;

    return { total, comRoteiro, emProducao, cidades };
  }, [allPautas]);

  const activeFiltersCount = useMemo(
    () =>
      [
        filters.status,
        filters.produtorId,
        filters.apresentadorId,
        filters.roteiristaId,
        filters.program,
        filters.cidade,
        filters.query.trim(),
      ].filter((value) => value && value !== "all").length,
    [filters],
  );

  const handleDeletePauta = async (pautaId) => {
    toast.promise(deletePauta(pautaId), {
      loading: "Excluindo pauta...",
      success: "Pauta movida para a lixeira!",
      error: "Falha ao excluir pauta.",
      duration: 1500,
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      produtorId: "all",
      apresentadorId: "all",
      roteiristaId: "all",
      program: "all",
      cidade: "all",
      query: "",
      sortBy: "recent",
    });
  };

  if (isLoading) {
    return (
      <LoadingOverlay
        message={"Carregando todas as pautas..."}
        success={false}
      />
    );
  }

  return (
    <div className="page-shell space-y-6 md:space-y-8">
      <div className="page-hero flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col items-start justify-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
            Operação de pauta
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-white shadow-[0_18px_34px_-18px_rgba(79,70,229,0.9)]">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Pautas
            </h1>
          </div>
          <p className="max-w-2xl text-base text-slate-600 md:text-lg">
            Todas as pautas cadastradas no sistema, com leitura mais rápida da
            operação.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-sm text-slate-600 shadow-sm backdrop-blur">
            <span className="font-semibold text-slate-900">
              {filteredPautas.length}
            </span>{" "}
            resultados visíveis
          </div>
          {user?.typeUser !== "Visualizador" && (
            <Button
              className="gap-2 px-4 text-base"
              onClick={() => navigate("/home/pautas/create")}
            >
              <Plus className="h-4 w-4" /> Cadastrar Pauta
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="No sistema"
          value={summary.total}
          hint="Pautas ativas cadastradas"
          accentClasses="text-cyan-600"
        />
        <SummaryCard
          label="Com roteiro"
          value={summary.comRoteiro}
          hint="Itens com desenvolvimento iniciado"
          accentClasses="text-indigo-600"
        />
        <SummaryCard
          label="Em produção"
          value={summary.emProducao}
          hint="Pautas em andamento agora"
          accentClasses="text-amber-600"
        />
        <SummaryCard
          label="Cobertura"
          value={summary.cidades}
          hint="Cidades mapeadas nas pautas"
          accentClasses="text-fuchsia-600"
        />
      </div>

      <Card className="filter-panel relative z-20 p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <ListFilter className="h-4 w-4 text-cyan-500" />
            Filtros inteligentes
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
              {activeFiltersCount} filtros ativos
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
              Ordenação:{" "}
              {sortOptions.find((item) => item.value === filters.sortBy)?.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2 md:col-span-2 xl:col-span-2">
            <Label>Busca rápida</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={filters.query}
                onChange={(event) =>
                  handleFilterChange("query", event.target.value)
                }
                placeholder="Busque por título, cidade, bairro ou status"
                className="h-11 rounded-2xl border-white/70 bg-white/85 pl-10 shadow-[0_14px_26px_-24px_rgba(15,23,42,0.45)]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Programa</Label>
            <Select
              options={programsOptions}
              value={programsOptions.find(
                (item) => item.value === filters.program,
              )}
              onChange={(opt) =>
                handleFilterChange("program", opt?.value || "all")
              }
              styles={selectStyles}
              menuPortalTarget={selectPortalTarget}
              menuPosition="fixed"
            />
          </div>

          <div className="space-y-2">
            <Label>Ordenar por</Label>
            <Select
              options={sortOptions}
              value={sortOptions.find((item) => item.value === filters.sortBy)}
              onChange={(opt) =>
                handleFilterChange("sortBy", opt?.value || "recent")
              }
              styles={selectStyles}
              menuPortalTarget={selectPortalTarget}
              menuPosition="fixed"
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              options={statusOptions}
              value={statusOptions.find(
                (item) => item.value === filters.status,
              )}
              onChange={(opt) =>
                handleFilterChange("status", opt?.value || "all")
              }
              styles={selectStyles}
              menuPortalTarget={selectPortalTarget}
              menuPosition="fixed"
            />
          </div>

          <div className="space-y-2">
            <Label>Cidade</Label>
            <Select
              options={cidadeOptions}
              value={cidadeOptions.find(
                (item) => item.value === filters.cidade,
              )}
              onChange={(opt) =>
                handleFilterChange("cidade", opt?.value || "all")
              }
              styles={selectStyles}
              menuPortalTarget={selectPortalTarget}
              menuPosition="fixed"
            />
          </div>

          <div className="space-y-2">
            <Label>Produtor</Label>
            <Select
              options={[
                { value: "all", label: "Todos os Produtores" },
                ...userOptions,
              ]}
              value={
                [
                  { value: "all", label: "Todos os Produtores" },
                  ...userOptions,
                ].find((item) => item.value === filters.produtorId) || {
                  value: "all",
                  label: "Todos os Produtores",
                }
              }
              isLoading={isLoadingCache}
              onChange={(opt) =>
                handleFilterChange("produtorId", opt?.value || "all")
              }
              styles={selectStyles}
              menuPortalTarget={selectPortalTarget}
              menuPosition="fixed"
            />
          </div>

          <div className="space-y-2">
            <Label>Apresentador</Label>
            <Select
              options={[
                { value: "all", label: "Todos os Apresentadores" },
                ...userOptions,
              ]}
              value={
                [
                  { value: "all", label: "Todos os Apresentadores" },
                  ...userOptions,
                ].find((item) => item.value === filters.apresentadorId) || {
                  value: "all",
                  label: "Todos os Apresentadores",
                }
              }
              isLoading={isLoadingCache}
              onChange={(opt) =>
                handleFilterChange("apresentadorId", opt?.value || "all")
              }
              styles={selectStyles}
              menuPortalTarget={selectPortalTarget}
              menuPosition="fixed"
            />
          </div>

          <div className="space-y-2">
            <Label>Roteirista</Label>
            <Select
              options={[
                { value: "all", label: "Todos os Roteiristas" },
                ...userOptions,
              ]}
              value={
                [
                  { value: "all", label: "Todos os Roteiristas" },
                  ...userOptions,
                ].find((item) => item.value === filters.roteiristaId) || {
                  value: "all",
                  label: "Todos os Roteiristas",
                }
              }
              isLoading={isLoadingCache}
              onChange={(opt) =>
                handleFilterChange("roteiristaId", opt?.value || "all")
              }
              styles={selectStyles}
              menuPortalTarget={selectPortalTarget}
              menuPosition="fixed"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 text-cyan-500" />
            Nova rodada de filtros: você pode cruzar equipe, local e ordenação
            sem perder a leitura da grade.
          </p>
          <Button
            variant="outline"
            className="gap-2 sm:w-auto"
            onClick={clearFilters}
          >
            <RotateCcw className="h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      </Card>

      {filteredPautas.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-cyan-300" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {activeFiltersCount > 0
                ? "Nenhuma pauta encontrada"
                : "Nenhuma pauta cadastrada"}
            </h3>
            <p className="text-muted-foreground">
              {activeFiltersCount > 0
                ? "Tente ajustar os filtros ou limpar a busca."
                : "Comece criando sua primeira pauta."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredPautas.map((pauta) => (
            <PautaCardGrid
              key={pauta.id}
              pauta={pauta}
              onView={() => navigate(`/home/pautas/${pauta.id}`)}
              onEdit={() => navigate(`/home/pautas/edit/${pauta.id}`)}
              onDelete={handleDeletePauta}
            />
          ))}
        </div>
      )}
    </div>
  );
}
