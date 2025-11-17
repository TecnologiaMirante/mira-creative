// /src/components/programas/ProgramasListPage.jsx

import { useState, useEffect, useMemo } from "react";
import { listenToProgramas, deletePrograma } from "../../../firebase";
import { LoadingOverlay } from "../LoadingOverlay";
import { ProgramaCard } from "./ProgramaCard";
import { Card } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CriarProgramaModal } from "./CriarProgramaModal";
import { EditarProgramaModal } from "./EditarProgramaModal";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import Select from "react-select";

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

export function ProgramasListPage() {
  const [allProgramas, setAllProgramas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: "all",
    nome: "all",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    // Chama o listener SIMPLES
    const unsubscribe = listenToProgramas((novosProgramas) => {
      setAllProgramas(novosProgramas); // Salva a lista completa
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProgramas = useMemo(() => {
    return allProgramas.filter((programa) => {
      if (filters.status !== "all" && programa.status !== filters.status)
        return false;
      if (filters.nome !== "all" && programa.nome !== filters.nome)
        return false;
      return true;
    });
  }, [allProgramas, filters]); // Recalcula quando a lista ou os filtros mudam

  const handleProgramaCreated = () => {
    // Não precisa fazer nada aqui. O listener vai pegar.
    setIsModalOpen(false);
  };

  const handleDeletePrograma = async (programaId) => {
    toast.promise(deletePrograma(programaId), {
      loading: "Excluindo programa...",
      success: "Programa movido para a lixeira!", // O listener atualiza a UI
      error: "Falha ao excluir programa.",
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
    // Não precisa fazer nada aqui. O listener vai pegar.
    handleCloseEditModal();
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    // Mostra o loading inicial
    return (
      <LoadingOverlay message={"Carregando programas..."} success={false} />
    );
  }

  return (
    <>
      <div className="p-8 space-y-8">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Programas</h1>
            <p className="text-lg text-muted-foreground">
              Selecione um programa para ver o espelho
            </p>
          </div>
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700 px-2 text-base text-white"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus /> Criar Programa
          </Button>
        </div>

        {/* FILTROS */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Filtro por Nome */}
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>Programa</Label>
              <Select
                options={programsOptions}
                defaultValue={programsOptions[0]}
                onChange={(opt) => handleFilterChange("nome", opt.value)}
              />
            </div>
            {/* Filtro por Status */}
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>Status</Label>
              <Select
                options={statusOptions}
                defaultValue={statusOptions[0]}
                onChange={(opt) => handleFilterChange("status", opt.value)}
              />
            </div>
          </div>
        </Card>

        {filteredProgramas.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum programa encontrado
              </h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou crie um novo programa.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
