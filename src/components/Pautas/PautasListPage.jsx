// /src/components/pautas/PautasListPage.jsx

import { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { deletePauta, getPautas } from "@infra/firebase";
import { LoadingOverlay } from "../LoadingOverlay";
import { Card } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PautaCardGrid } from "./PautaCardGrid";
import { useUserCache } from "@/context/UserCacheContext";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import UserContext from "@/context/UserContext";

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

export function PautasListPage() {
  const { user } = useContext(UserContext);

  const [allPautas, setAllPautas] = useState([]);
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
  });

  const userOptions = useMemo(() => {
    if (isLoadingCache || !userCache) return [];
    const options = [...userCache.values()].map((user) => ({
      value: user.uid,
      label: user.display_name,
    }));
    return options;
  }, [userCache, isLoadingCache]);

  const cidadeOptions = useMemo(() => {
    // Cria opções a partir das pautas carregadas
    const cidadesUnicas = [
      ...new Set(allPautas.map((p) => p.cidade).filter(Boolean)),
    ];
    const options = cidadesUnicas.map((c) => ({ value: c, label: c }));
    return [{ value: "all", label: "Todas as Cidades" }, ...options];
  }, [allPautas]); // Recalcula se as pautas mudarem

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = getPautas((novasPautas) => {
      setAllPautas(novasPautas);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []); // Recarrega se os filtros mudarem

  const filteredPautas = useMemo(() => {
    return allPautas.filter((pauta) => {
      if (filters.status !== "all" && pauta.status !== filters.status)
        return false;
      if (
        filters.produtorId !== "all" &&
        pauta.produtorId !== filters.produtorId
      )
        return false;
      if (
        filters.apresentadorId !== "all" &&
        pauta.apresentadorId !== filters.apresentadorId
      )
        return false;
      if (
        filters.roteiristaId !== "all" &&
        pauta.roteiristaId !== filters.roteiristaId
      )
        return false;
      if (filters.program !== "all" && pauta.program !== filters.program)
        return false;
      if (filters.cidade !== "all" && pauta.cidade !== filters.cidade)
        return false;
      return true; // Se passou por todos os filtros, inclua
    });
  }, [allPautas, filters]); // Recalcula SÓ se a lista inteira ou os filtros mudarem

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

  if (isLoading) {
    return (
      <LoadingOverlay
        message={"Carregando todas as pautas..."}
        success={false}
      />
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col justify-center items-start space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold">Pautas</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Todas as pautas cadastradas no sistema
          </p>
        </div>
        {user?.typeUser !== "Visualizador" && (
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700 px-2 text-base text-white"
            onClick={() => navigate("/home/pautas/create")}
          >
            <Plus className="h-4 w-4" /> Cadastrar Pauta
          </Button>
        )}
      </div>
      {/* FILTROS */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filtro por Programa */}
          <div className="space-y-2">
            <Label>Programa</Label>
            <Select
              options={programsOptions}
              defaultValue={programsOptions[0]}
              onChange={(opt) => handleFilterChange("program", opt.value)}
            />
          </div>

          {/* Filtro por Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              options={statusOptions}
              defaultValue={statusOptions[0]}
              onChange={(opt) => handleFilterChange("status", opt.value)}
            />
          </div>

          {/* Filtro por Cidade */}
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Select
              options={cidadeOptions}
              defaultValue={cidadeOptions[0]}
              onChange={(opt) => handleFilterChange("cidade", opt.value)}
            />
          </div>

          {/* Filtro por Produtor */}
          <div className="space-y-2">
            <Label>Produtor</Label>
            <Select
              options={[
                { value: "all", label: "Todos os Produtores" },
                ...userOptions,
              ]}
              defaultValue={{ value: "all", label: "Todos os Produtores" }}
              isLoading={isLoadingCache}
              onChange={(opt) => handleFilterChange("produtorId", opt.value)}
            />
          </div>

          {/* Filtro por Apresentador */}
          <div className="space-y-2">
            <Label>Apresentador</Label>
            <Select
              options={[
                { value: "all", label: "Todos os Apresentadores" },
                ...userOptions,
              ]}
              defaultValue={{ value: "all", label: "Todos os Apresentadores" }}
              isLoading={isLoadingCache}
              onChange={(opt) =>
                handleFilterChange("apresentadorId", opt.value)
              }
            />
          </div>

          {/* Filtro por Roteirista */}
          <div className="space-y-2">
            <Label>Roteirista</Label>
            <Select
              options={[
                { value: "all", label: "Todos os Roteiristas" },
                ...userOptions,
              ]}
              defaultValue={{ value: "all", label: "Todos os Roteiristas" }}
              isLoading={isLoadingCache}
              onChange={(opt) => handleFilterChange("roteiristaId", opt.value)}
            />
          </div>
        </div>
      </Card>
      {filteredPautas.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {/* Mensagem dinâmica se houver filtro */}
              {filters.status !== "all" || filters.produtorId !== "all"
                ? "Nenhuma pauta encontrada"
                : "Nenhuma pauta cadastrada"}
            </h3>
            <p className="text-muted-foreground">
              {filters.status !== "all" || filters.produtorId !== "all"
                ? "Tente ajustar os filtros ou crie uma nova pauta."
                : "Comece criando sua primeira pauta."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
