// /src/components/pautas/PautasListPage.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllVisiblePautas, deletePauta } from "../../../firebase";
import { LoadingOverlay } from "../LoadingOverlay";
import { Card } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PautaCard } from "./PautaCard";

export function PautasListPage() {
  const [pautas, setPautas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPautas = async () => {
      setIsLoading(true);
      const data = await getAllVisiblePautas();
      setPautas(data);
      setIsLoading(false);
    };
    fetchPautas();
  }, []);

  const handleDeletePauta = async (pautaId) => {
    toast.promise(deletePauta(pautaId), {
      loading: "Excluindo pauta...",
      success: () => {
        setPautas((prev) => prev.filter((p) => p.id !== pautaId));
        return "Pauta movida para a lixeira!";
      },
      error: "Falha ao excluir pauta.",
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
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Pautas</h1>
          <p className="text-lg text-muted-foreground">
            Todas as pautas cadastradas no sistema.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => navigate("/home/pautas/create")}
        >
          <Plus className="h-4 w-4" /> Criar Pauta
        </Button>
      </div>

      {pautas.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma pauta cadastrada
            </h3>
            <p className="text-muted-foreground">
              Comece criando sua primeira pauta.
            </p>
          </div>
        </Card>
      ) : (
        // Usando o mesmo layout de grid da tela de Programas
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pautas.map((pauta) => (
            <PautaCard
              key={pauta.id}
              pauta={pauta}
              programaNome={pauta.program} // O 'PautaCard' espera 'programaNome'
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
