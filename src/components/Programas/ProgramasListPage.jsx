// /src/components/programas/ProgramasListPage.jsx

import { useState, useEffect } from "react";
import { getProgramas, deletePrograma } from "../../../firebase";
import { LoadingOverlay } from "../LoadingOverlay";
import { ProgramaCard } from "./ProgramaCard";
import { Card } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CriarProgramaModal } from "./CriarProgramaModal";
import { EditarProgramaModal } from "./EditarProgramaModal";
import { toast } from "sonner";

export function ProgramasListPage() {
  const [programas, setProgramas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // 2. NOVO ESTADO
  const [selectedPrograma, setSelectedPrograma] = useState(null);

  const fetchProgramas = async () => {
    setIsLoading(true);
    const data = await getProgramas();
    setProgramas(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProgramas();
  }, []);

  const handleProgramaCreated = (novoPrograma) => {
    // Adiciona o novo programa à lista e reordena
    const programaParaUI = {
      ...novoPrograma,
      dataExibicao: {
        toDate: () => novoPrograma.dataExibicao,
      },
    };

    setProgramas((prev) =>
      [...prev, programaParaUI].sort(
        (a, b) => b.dataExibicao.toDate() - a.dataExibicao.toDate()
      )
    );
  };

  const handleDeletePrograma = async (programaId) => {
    toast.promise(deletePrograma(programaId), {
      loading: "Excluindo programa...",
      success: () => {
        // Atualiza a UI removendo o programa da lista
        setProgramas((prev) => prev.filter((p) => p.id !== programaId));
        return "Programa movido para a lixeira!";
      },
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

  const handleProgramaUpdated = (programaAtualizado) => {
    // Atualiza o programa na lista da UI
    setProgramas((prev) =>
      prev.map((p) => (p.id === programaAtualizado.id ? programaAtualizado : p))
    );
  };

  if (isLoading) {
    return (
      <LoadingOverlay message={"Carregando programas..."} success={false} />
    );
  }

  return (
    <>
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
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

        {programas.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum programa cadastrado
              </h3>
              <p className="text-muted-foreground">
                Comece criando seu primeiro programa.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programas.map((programa) => (
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
