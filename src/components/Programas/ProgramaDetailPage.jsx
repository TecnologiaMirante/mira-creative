// /src/components/programas/ProgramaDetailPage.jsx

import { useState, useEffect, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPrograma,
  getEspelho,
  getPautasByIds,
  updateEspelhoPautas,
  removePautaFromEspelho,
  addPautaToEspelho,
  updateProgramaDuracao,
  createEspelho,
} from "../../../firebase";
import { LoadingOverlay } from "../LoadingOverlay";
import {
  FileText,
  Plus,
  Save,
  Clock,
  CalendarIcon,
  Circle,
} from "lucide-react";
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
import {
  convertTimestamp,
  getStatusStyle,
  calcularTotalEmSegundos,
  formatSegundos,
} from "@/lib/utils";
import UserContext from "@/context/UserContext";
import { SortablePautaCard } from "../Pautas/SortablePautaCard";
import { AdicionarPautaModal } from "../Pautas/AdicionarPautaModal";

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

  // Calcula o total em segundos baseado nas pautas carregadas atualmente na tela
  const totalSegundosCalculado = useMemo(
    () => calcularTotalEmSegundos(pautas),
    [pautas]
  );

  const duracaoVisual = formatSegundos(totalSegundosCalculado);

  // Sensor para D&D (para não ativar ao clicar em botões)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Só começa a arrastar se mover 8px
      },
    })
  );

  // --- CARREGAMENTO DE DADOS ---
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
      // Reordena baseado no array do espelho
      const pautasOrdenadas = espelhoData.pautasOrdenadas
        .map((id) => pautasData.find((p) => p.id === id))
        .filter(Boolean);

      setPautas(pautasOrdenadas);
      setIsLoading(false);
    };

    fetchData();
  }, [programaId]);

  useEffect(() => {
    // Só roda se já tiver carregado o programa e as pautas
    if (!isLoading && programa && pautas.length >= 0) {
      const totalReal = calcularTotalEmSegundos(pautas);
      const totalNoBanco = programa.duracaoTotalSegundos || 0;

      // Se houver diferença, atualiza o banco silenciosamente
      if (totalReal !== totalNoBanco) {
        console.log(
          `Sincronizando duração: Banco(${totalNoBanco}) vs Real(${totalReal})`
        );
        updateProgramaDuracao(programa.id, totalReal).then(() => {
          // Atualiza o estado local para refletir a mudança sem precisar recarregar
          setPrograma((prev) => ({ ...prev, duracaoTotalSegundos: totalReal }));
        });
      }
    }
  }, [pautas, programa, isLoading]);

  const handleViewPauta = (pauta) => {
    navigate(`/home/pautas/${pauta.id}`);
  };

  const handleEditPauta = (pauta) => {
    navigate(`/home/pautas/edit/${pauta.id}`);
  };

  const handleRemovePauta = async (pautaId) => {
    if (!espelho || !programa) return;
    const pautaParaRemover = pautas.find((p) => p.id === pautaId);
    if (!pautaParaRemover) return;

    setIsSaving(true);
    const success = await removePautaFromEspelho(
      espelho.id,
      pautaParaRemover,
      programa.id
    );

    if (success) {
      setPautas((prevPautas) => prevPautas.filter((p) => p.id !== pautaId));
      // Atualizamos o programa localmente também para feedback imediato
      setPrograma((prev) => ({
        ...prev,
        pautaCount: Math.max(0, (prev.pautaCount || 0) - 1),
      }));
      toast.success("Pauta removida do espelho.", { duration: 1500 });
    } else {
      toast.error("Erro ao remover pauta.", { duration: 1500 });
    }
    setIsSaving(false);
  };

  const handlePautaAdded = async (pautaId) => {
    if (!espelho || !programa) return;
    const pautasData = await getPautasByIds([pautaId]);
    if (pautasData.length === 0) {
      toast.error("Erro ao buscar dados da pauta.", { duration: 1500 });
      return;
    }
    const pautaParaAdicionar = pautasData[0];
    const success = await addPautaToEspelho(
      espelho.id,
      pautaParaAdicionar,
      programa.id
    );

    if (success) {
      setPautas((prevPautas) => [...prevPautas, pautaParaAdicionar]);
      setPrograma((prev) => ({
        ...prev,
        pautaCount: (prev.pautaCount || 0) + 1,
      }));
      toast.success("Pauta adicionada ao espelho!", { duration: 1500 });
    } else {
      toast.error("Erro ao adicionar pauta.", { duration: 1500 });
    }
  };

  const handleCreateEspelho = async () => {
    if (!programa || !user) {
      toast.error("Erro: Programa ou usuário não carregado.", {
        duration: 1500,
      });
      return;
    }
    setIsCreatingEspelho(true);
    const newEspelhoData = await createEspelho(programa.id, user.uid);
    if (newEspelhoData) {
      setEspelho(newEspelhoData);
      setPrograma((prev) => ({ ...prev, espelhoId: newEspelhoData.id }));
      toast.success("Espelho criado com sucesso!", { duration: 1500 });
    } else {
      toast.error("Falha ao criar o espelho.", { duration: 1500 });
    }
    setIsCreatingEspelho(false);
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
      toast.success("Ordem do espelho salva!", { duration: 1500 });
      setIsSaving(false);
    }
  };

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
              Este programa ainda não possui um espelho
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

  const StatusBadge = ({ status }) => {
    const style = getStatusStyle(status);
    return (
      <div className="flex items-center gap-2">
        <Circle className={`h-2 w-2 ${style}`} />
        <p className={`font-semibold ${style}`}>{status || "Status N/D"}</p>
      </div>
    );
  };

  // 8. Renderização principal (com DndContext)
  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="p-8 space-y-4">
          {/* Cabeçalho com botões */}
          <div className="flex flex-wrap gap-4 justify-between items-start">
            {/* Títulos e Infos */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">
                Espelho:{" "}
                <span className="text-indigo-600">
                  {programa?.nome || "Programa"}
                </span>
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
                {/* Data de Exibição */}
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{convertTimestamp(programa?.dataExibicao)}</span>
                </div>
                {/* Status */}
                <div className="flex items-center">
                  <StatusBadge status={programa?.status} />
                </div>
                {/* Contagem de Pautas */}
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  <span>{pautas.length} pauta(s)</span>
                </div>
                {/* Duração Total */}
                <div className="flex items-center gap-1.5 font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Clock className="h-4 w-4" />
                  <span>Duração: {duracaoVisual}</span>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2 items-center shrink-0">
              {/* Botão de "Salvando..." (só aparece quando está salvando) */}
              {isSaving && (
                <Button
                  variant="outline"
                  disabled
                  className="gap-2 cursor-wait"
                >
                  <Save className="h-4 w-4 animate-spin" />
                  Salvando...
                </Button>
              )}
              {/* Botão de Adicionar */}
              <Button
                className="gap-2 bg-blue-600 hover:bg-blue-700 px-2 text-base text-white"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4 text-white" />
                <span className="font-semibold">Vincular Pauta</span>
              </Button>
              {/* Botão de Cadastrar */}
              <Button
                variant="outline"
                onClick={() =>
                  navigate("/home/pautas/create", {
                    state: {
                      espelhoId: espelho?.id,
                      programaNome: programa?.nome,
                    },
                  })
                }
                className="gap-2 bg-white hover:text-blue-700 px-2 text-base text-blue-600"
              >
                <Plus className="h-4 w-4 text-blue-600" />

                <span className="font-semibold">Cadastrar Pauta</span>
              </Button>
            </div>
          </div>

          <p className="text-muted-foreground">
            Arraste as pautas para reordenar o espelho.
          </p>

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
                    Clique em "Vincular Pauta" para começar
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
                    onRemove={handleRemovePauta}
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
        pautasAtuais={pautas}
        onPautaAdded={handlePautaAdded}
      />
    </>
  );
}
