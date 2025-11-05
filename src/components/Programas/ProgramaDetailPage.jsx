// /src/components/programas/ProgramaDetailPage.jsx

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPrograma,
  getEspelho,
  getPautasByIds,
  updateEspelhoPautas,
  removePautaFromEspelho,
  addPautaToEspelho,
  createEspelho,
} from "../../../firebase";
import { LoadingOverlay } from "../LoadingOverlay";
import { SortablePautaCard } from "../pautas/SortablePautaCard";
import { AdicionarPautaModal } from "../pautas/AdicionarPautaModal"; // 2. IMPORTE O MODAL
import { FileText, Plus, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { getStatusStyle } from "@/lib/utils";
import UserContext from "@/context/UserContext"; // 3. IMPORTE O UserContext

export function ProgramaDetailPage() {
  const { id: programaId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [programa, setPrograma] = useState(null);
  const [espelho, setEspelho] = useState(null);
  const [pautas, setPautas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingEspelho, setIsCreatingEspelho] = useState(false);

  // Sensor para D&D (para não ativar ao clicar em botões)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Só começa a arrastar se mover 8px
      },
    })
  );

  useEffect(() => {
    if (!programaId) return;
    const fetchData = async () => {
      setIsLoading(true);
      const programaData = await getPrograma(programaId);
      if (!programaData) {
        setIsLoading(false);
        return;
      }
      setPrograma(programaData);

      if (!programaData.espelhoId) {
        setIsLoading(false);
        return;
      }
      const espelhoData = await getEspelho(programaData.espelhoId);
      if (!espelhoData) {
        setIsLoading(false);
        return;
      }
      setEspelho(espelhoData);

      const pautasData = await getPautasByIds(espelhoData.pautasOrdenadas);
      const pautasOrdenadas = espelhoData.pautasOrdenadas
        .map((id) => pautasData.find((p) => p.id === id))
        .filter(Boolean);

      setPautas(pautasOrdenadas); // 4. Define o estado local
      setIsLoading(false);
    };

    fetchData();
  }, [programaId]);

  const handleViewPauta = (pauta) => {
    navigate(`/home/pautas/${pauta.id}`);
  };

  const handleEditPauta = (pauta) => {
    navigate(`/home/pautas/edit/${pauta.id}`);
  };

  const handleRemovePauta = async (pautaId) => {
    if (!espelho) return;
    setIsSaving(true);
    const success = await removePautaFromEspelho(espelho.id, pautaId);
    if (success) {
      // Atualiza o estado local
      setPautas((prevPautas) => prevPautas.filter((p) => p.id !== pautaId));
      toast.success("Pauta removida do espelho.");
    } else {
      toast.error("Erro ao remover pauta.");
    }
    setIsSaving(false);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      // 1. Atualiza o estado local (UI)
      const oldIndex = pautas.findIndex((p) => p.id === active.id);
      const newIndex = pautas.findIndex((p) => p.id === over.id);
      const newPautas = arrayMove(pautas, oldIndex, newIndex);
      setPautas(newPautas);

      // 2. Salva no Firebase (Backend)
      setIsSaving(true);
      const pautaIds = newPautas.map((p) => p.id);
      await updateEspelhoPautas(espelho.id, pautaIds);
      toast.success("Ordem do espelho salva!");
      setIsSaving(false);
    }
  };

  const handlePautaAdded = async (pautaId) => {
    if (!espelho) return;

    const success = await addPautaToEspelho(espelho.id, pautaId);

    if (success) {
      const pautasData = await getPautasByIds([pautaId]);
      if (pautasData.length > 0) {
        setPautas((prevPautas) => [...prevPautas, pautasData[0]]);
        toast.success("Pauta adicionada ao espelho!");
      }
    } else {
      toast.error("Erro ao adicionar pauta.");
    }
  };

  const handleCreateEspelho = async () => {
    if (!programa || !user) {
      toast.error("Erro: Programa ou usuário não carregado.");
      return;
    }

    setIsCreatingEspelho(true);

    const newEspelhoData = await createEspelho(programa.id, user.uid);

    if (newEspelhoData) {
      setEspelho(newEspelhoData); // Atualiza o estado para mostrar o espelho vazio
      setPrograma((prev) => ({ ...prev, espelhoId: newEspelhoData.id }));
      toast.success("Espelho criado com sucesso!");
    } else {
      toast.error("Falha ao criar o espelho.");
    }
    setIsCreatingEspelho(false);
  };

  function convertTimestamp(timestamp) {
    if (!timestamp) return "Não definida";
    try {
      const date = timestamp.toDate();
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return "Data inválida";
    }
  }

  if (isLoading) {
    return <LoadingOverlay message={"Carregando espelho..."} success={false} />;
  }

  if (!espelho) {
    return (
      <div className="p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">
            Espelho: {programa?.nome || "Programa"}
          </h1>
        </div>
        <Card className="p-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum espelho criado
            </h3>
            <p className="text-muted-foreground mb-4">
              Este programa ainda não possui um espelho.
            </p>
            <Button
              onClick={handleCreateEspelho}
              disabled={isCreatingEspelho}
              className="gap-2"
            >
              {isCreatingEspelho ? (
                <Save className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isCreatingEspelho ? "Criando..." : "Criar Espelho"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const statusStyle = getStatusStyle(programa?.status);

  // 8. Renderização principal (com DndContext)
  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="p-8 space-y-6">
          {/* Cabeçalho com botões */}
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">
                Espelho: {programa?.nome || "Programa"} -{" "}
                {convertTimestamp(programa?.dataExibicao)} -{" "}
                <span className={statusStyle}>{programa?.status}</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {pautas.length} pauta(s) no espelho. Arraste para reordenar.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                className="gap-2 bg-blue-600 hover:bg-blue-700 px-2 text-base text-white"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus />
                Adicionar Pauta
              </Button>
              {isSaving && (
                <Button variant="outline" disabled>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </Button>
              )}
            </div>
          </div>

          {/* Lista de Pautas (com D&D) */}
          <SortableContext
            items={pautas.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {pautas.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhuma pauta no espelho
                  </h3>
                  <p className="text-muted-foreground">
                    Clique em "Adicionar Pauta" para começar.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {pautas.map((pauta) => (
                  <SortablePautaCard
                    key={pauta.id}
                    pauta={pauta}
                    programaNome={programa.nome}
                    onView={handleViewPauta}
                    onEdit={handleEditPauta}
                    onRemove={handleRemovePauta} // Passe o handler de remover
                  />
                ))}
              </div>
            )}
          </SortableContext>
        </div>
      </DndContext>
      <AdicionarPautaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        espelhoId={espelho?.id}
        pautasAtuais={pautas}
        onPautaAdded={handlePautaAdded}
      />
    </>
  );
}
