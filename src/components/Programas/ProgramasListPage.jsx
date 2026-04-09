import { useState, useEffect, useMemo, useContext } from "react";
import { getProgramas, deletePrograma } from "../../../firebaseClient";
import { LoadingOverlay } from "../LoadingOverlay";
import { ProgramaCard } from "./ProgramaCard";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  ListFilter,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CriarProgramaModal } from "./CriarProgramaModal";
import { EditarProgramaModal } from "./EditarProgramaModal";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import UserContext from "@/context/UserContext";
import { selectPortalTarget, selectStyles } from "@/lib/selectStyles";
import { normalizeText } from "@/lib/utils";

const statusOptions = [
  { value: "all", label: "Todos os Status" },
  { value: "Aprovado", label: "Aprovado" },
  { value: "Em Produção", label: "Em Produção" },
  { value: "Exibido", label: "Exibido" },
  { value: "Em Revisão", label: "Em Revisão" },
  { value: "Cancelado", label: "Cancelado" },
];

const programsOptions = [
  { value: "all", label: "Todos os Programas" },
  { value: "Daqui", label: "Daqui" },
  { value: "Especial", label: "Especial" },
];

const sortOptions = [
  { value: "recent", label: "Mais recentes" },
  { value: "name-asc", label: "Nome A-Z" },
  { value: "name-desc", label: "Nome Z-A" },
  { value: "status", label: "Por status" },
  { value: "pautas", label: "Mais pautas" },
];

const isSameDay = (timestamp) => {
  const date = timestamp?.toDate?.();
  if (!date) return false;
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

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

export function ProgramasListPage() {
  const { user } = useContext(UserContext);

  const [allProgramas, setAllProgramas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    nome: "all",
    query: "",
    sortBy: "recent",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = getProgramas((novosProgramas) => {
      setAllProgramas(novosProgramas);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProgramas = useMemo(() => {
    const filtered = allProgramas.filter((programa) => {
      if (filters.status !== "all" && programa.status !== filters.status) {
        if (normalizeText(programa.status) !== normalizeText(filters.status)) {
          return false;
        }
      }

      if (filters.nome !== "all") {
        const filterValue = normalizeText(filters.nome);
        const programName = normalizeText(programa.nome);

        if (!programName.includes(filterValue)) return false;
      }

      if (filters.query.trim()) {
        const haystack = [
          programa.nome,
          programa.status,
          programa.lastEditedByName,
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
      case "name-asc":
        sorted.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
        break;
      case "name-desc":
        sorted.sort((a, b) => (b.nome || "").localeCompare(a.nome || ""));
        break;
      case "status":
        sorted.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
        break;
      case "pautas":
        sorted.sort((a, b) => (b.pautaCount || 0) - (a.pautaCount || 0));
        break;
      default:
        sorted.sort((a, b) => {
          const timeA = a.dataExibicao?.seconds || 0;
          const timeB = b.dataExibicao?.seconds || 0;
          return timeB - timeA;
        });
    }

    return sorted;
  }, [allProgramas, filters]);

  const summary = useMemo(() => {
    const total = allProgramas.length;
    const exibidos = allProgramas.filter(
      (item) => item.status === "Exibido",
    ).length;
    const hoje = allProgramas.filter((item) =>
      isSameDay(item.dataExibicao),
    ).length;
    const emAndamento = allProgramas.filter((item) =>
      ["Aprovado", "Em Produção", "Em Revisão"].includes(item.status),
    ).length;

    return { total, exibidos, hoje, emAndamento };
  }, [allProgramas]);

  const activeFiltersCount = useMemo(
    () =>
      [filters.status, filters.nome, filters.query.trim()].filter(
        (value) => value && value !== "all",
      ).length,
    [filters],
  );

  const handleProgramaCreated = () => {
    setIsModalOpen(false);
  };

  const handleDeletePrograma = async (programaId) => {
    toast.promise(deletePrograma(programaId), {
      loading: "Excluindo programa...",
      success: "Programa movido para a lixeira!",
      error: "Falha ao excluir programa.",
      duration: 1500,
    });
  };

  const handleOpenEditModal = (programa) => {
    setSelectedPrograma(programa);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedPrograma(null);
  };

  const handleProgramaUpdated = () => {
    handleCloseEditModal();
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      nome: "all",
      query: "",
      sortBy: "recent",
    });
  };

  if (isLoading) {
    return (
      <LoadingOverlay message={"Carregando programas..."} success={false} />
    );
  }

  return (
    <>
      <div className="page-shell space-y-6 md:space-y-8">
        <div className="page-hero flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-700 shadow-sm">
              Curadoria editorial
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Programas
            </h1>
            <p className="max-w-2xl text-base text-slate-600 md:text-lg">
              Selecione um programa para ver o espelho e acompanhe o panorama da
              grade em tempo real.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-sm text-slate-600 shadow-sm backdrop-blur">
              <span className="font-semibold text-slate-900">
                {filteredProgramas.length}
              </span>{" "}
              resultados visíveis
            </div>
            {user?.typeUser !== "Visualizador" && (
              <Button
                className="gap-2 px-4 text-base sm:w-auto"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus /> Criar Programa
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="No acervo"
            value={summary.total}
            hint="Programas ativos no sistema"
            accentClasses="text-indigo-600"
          />
          <SummaryCard
            label="Em andamento"
            value={summary.emAndamento}
            hint="Fluxos com produção viva"
            accentClasses="text-cyan-600"
          />
          <SummaryCard
            label="Hoje"
            value={summary.hoje}
            hint="Exibições previstas para hoje"
            accentClasses="text-emerald-600"
          />
          <SummaryCard
            label="Exibidos"
            value={summary.exibidos}
            hint="Itens já concluídos na grade"
            accentClasses="text-fuchsia-600"
          />
        </div>

        <Card className="filter-panel relative z-20 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ListFilter className="h-4 w-4 text-indigo-500" />
              Filtros inteligentes
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                {activeFiltersCount} filtros ativos
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                Ordenação:{" "}
                {
                  sortOptions.find((item) => item.value === filters.sortBy)
                    ?.label
                }
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2 md:col-span-2 xl:col-span-1">
              <Label>Busca rápida</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={filters.query}
                  onChange={(event) =>
                    handleFilterChange("query", event.target.value)
                  }
                  placeholder="Busque por nome, status ou editor"
                  className="h-11 rounded-2xl border-white/70 bg-white/85 pl-10 shadow-[0_14px_26px_-24px_rgba(15,23,42,0.45)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Programa</Label>
              <Select
                options={programsOptions}
                value={programsOptions.find(
                  (item) => item.value === filters.nome,
                )}
                onChange={(opt) =>
                  handleFilterChange("nome", opt?.value || "all")
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
              <Label>Ordenar por</Label>
              <Select
                options={sortOptions}
                value={sortOptions.find(
                  (item) => item.value === filters.sortBy,
                )}
                onChange={(opt) =>
                  handleFilterChange("sortBy", opt?.value || "recent")
                }
                styles={selectStyles}
                menuPortalTarget={selectPortalTarget}
                menuPosition="fixed"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Sparkles className="h-4 w-4 text-cyan-500" />
              Dica: use busca + ordenação para localizar programas prontos para
              revisão mais rápido.
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

        {filteredProgramas.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-indigo-300" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Nenhum programa encontrado
              </h3>
              <p className="text-slate-500">
                Tente ajustar os filtros, limpar a busca ou criar um novo
                programa.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProgramas.map((programa) => (
              <ProgramaCard
                key={programa.id}
                programa={programa}
                onDelete={handleDeletePrograma}
                onEdit={handleOpenEditModal}
              />
            ))}
          </div>
        )}
      </div>

      <CriarProgramaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProgramaCreated={handleProgramaCreated}
      />
      {selectedPrograma && (
        <EditarProgramaModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onProgramaUpdated={handleProgramaUpdated}
          programa={selectedPrograma}
        />
      )}
    </>
  );
}
