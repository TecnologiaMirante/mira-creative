// /src/components/pautas/PautaDetailPage.jsx

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getPauta,
  getRoteiro,
  updateRoteiro,
  updatePauta,
  createRoteiro,
} from "../../../firebase";
import { LoadingOverlay } from "../LoadingOverlay";
import UserContext from "@/context/UserContext";
import { ArrowLeft, Save, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { BasicInfoCard } from "../Card/BasicInfoCard";
import { DetailedScriptCard } from "../Card/DetailedScriptCard ";
import { Card, CardContent } from "../ui/card";

export function PautaDetailPage() {
  const { id: pautaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);

  const mode = location.pathname.includes("/edit") ? "edit" : "view";
  const isReadOnly = mode === "view";

  const [pauta, setPauta] = useState(null);
  const [roteiro, setRoteiro] = useState(null);
  const [scriptRows, setScriptRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States do BasicInfoCard
  const [cidades, setCidades] = useState([]);
  const [dateValidationError, setDateValidationError] = useState("");

  // States do DetailedScriptCard
  const [isAIAssistantLoading, setIsAIAssistantLoading] = useState(false);
  const [hasSuggestions, setHasSuggestions] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // 1. Buscar a Pauta
      const pautaData = await getPauta(pautaId);
      if (!pautaData) {
        toast.error("Pauta não encontrada.");
        navigate("/home/programas");
        return;
      }

      // Converte Timestamps do Firebase para objetos Date
      const formattedPauta = {
        ...pautaData,
        dataGravacaoInicio: pautaData.dataGravacaoInicio
          ? pautaData.dataGravacaoInicio.toDate()
          : null,
        dataGravacaoFim: pautaData.dataGravacaoFim
          ? pautaData.dataGravacaoFim.toDate()
          : null,
        dataExibicao: pautaData.dataExibicao
          ? pautaData.dataExibicao.toDate()
          : null,
        dataCancelamento: pautaData.dataCancelamento
          ? pautaData.dataCancelamento.toDate()
          : null,
      };
      setPauta(formattedPauta);

      if (pautaData.roteiroId) {
        // Se a pauta TEM um roteiro, carregue-o
        const roteiroData = await getRoteiro(pautaData.roteiroId);
        if (roteiroData) {
          setRoteiro(roteiroData);
          setScriptRows(
            roteiroData.scriptRows?.length > 0
              ? roteiroData.scriptRows
              : [{ id: uuidv4(), video: "", texto: "" }]
          );
        } else {
          // A pauta fica "órfã", mas o usuário pode criar um novo
          toast.error(`Roteiro (ID: ${pautaData.roteiroId}) não encontrado.`);
          setPauta((prev) => ({ ...prev, roteiroId: null }));
          setRoteiro(null);
        }
      } else {
        // Se a pauta NÃO TEM roteiro, não fazemos nada.
        // O estado 'roteiro' permanece nulo.
        console.log("Esta pauta ainda não tem um roteiro.");
        setRoteiro(null);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [pautaId, navigate]);

  // useEffect das Cidades (copiado do ScriptForm)
  useEffect(() => {
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados/21/municipios"
    )
      .then((res) => res.json())
      .then((data) => {
        const lista = data.map((c) => c.nome);
        setCidades([
          "MARANHÃO",
          "São Luís",
          ...lista.filter((c) => c !== "São Luís"),
        ]);
      })
      .catch((err) => console.error("Erro ao carregar cidades:", err));
  }, []);

  // useEffect de Validação de Data
  useEffect(() => {
    const dataInicio = pauta?.dataGravacaoInicio;
    if (dataInicio && pauta?.dataExibicao) {
      if (pauta.dataExibicao < dataInicio) {
        setDateValidationError(
          "A data de exibição não pode ser anterior à data de gravação."
        );
      } else {
        setDateValidationError("");
      }
    } else {
      setDateValidationError("");
    }
  }, [pauta?.dataGravacaoInicio, pauta?.dataExibicao]);

  // Handler de Input (copiado do ScriptForm)
  const handleInputChange = (field, value) => {
    setPauta((prev) => {
      const newState = { ...prev, [field]: value };

      if (field === "dataGravacao") {
        if (value?.from) {
          // Se for um range
          newState.dataGravacaoInicio = value.from;
          newState.dataGravacaoFim = value.to || null;
        } else {
          // Se for data única (ou nulo)
          newState.dataGravacaoInicio = value;
          newState.dataGravacaoFim = null;
        }
      }

      if (field === "status" && value !== "Cancelado") {
        newState.motivoCancelamento = "";
        newState.dataCancelamento = null;
      }
      return newState;
    });
  };

  // --- Handlers para o DetailedScriptCard ---
  const handleUpdateRow = (rowId, field, value) => {
    setScriptRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleAddRow = () => {
    setScriptRows((prevRows) => [
      ...prevRows,
      { id: uuidv4(), video: "", texto: "" },
    ]);
  };

  const handleRemoveRow = (rowId) => {
    setScriptRows((prevRows) => prevRows.filter((row) => row.id !== rowId));
  };

  const handleAdicionarRoteiro = () => {
    if (!pauta.roteiristaId) {
      toast.error("Erro", {
        description:
          "Você deve primeiro salvar um Roteirista antes de adicionar um roteiro.",
      });
      return;
    }

    // Seta o roteiro "temp", que fará o DetailedScriptCard aparecer
    setRoteiro({ id: "temp", pautaId: pauta.id });
    setScriptRows([{ id: uuidv4(), video: "", texto: "" }]);
  };

  // Handler para Salvar (ambos os documentos)
  const handleSaveChanges = async () => {
    // 1. VERIFICAÇÃO SIMPLIFICADA
    if (!pauta || !user) {
      toast.error("Erro: Dados da pauta ou usuário não carregados.");
      return;
    }
    if (dateValidationError) {
      toast.error("Erro de Validação", { description: dateValidationError });
      return;
    }

    setIsSaving(true);

    // Prepara os dados da Pauta
    const pautaDataToSave = {
      program: pauta.program,
      produtorId: pauta.produtorId,
      apresentadorId: pauta.apresentadorId,
      roteiristaId: pauta.roteiristaId,
      cidade: pauta.cidade,
      bairro: pauta.bairro,
      titulo: pauta.titulo,
      dataGravacaoInicio: pauta.dataGravacaoInicio,
      dataGravacaoFim: pauta.dataGravacaoFim,
      dataExibicao: pauta.dataExibicao,
      duracaoMinutos: pauta.duracaoMinutos || "00",
      duracaoSegundos: pauta.duracaoSegundos || "00",
      status: pauta.status,
      motivoCancelamento: pauta.motivoCancelamento || "",
      dataCancelamento: pauta.dataCancelamento || null,
    };

    try {
      // 2. VERIFICA SE O ROTEIRO EXISTE (ou está sendo criado)
      if (roteiro) {
        // Se o roteiro existe (é 'temp' ou real), salvamos AMBOS

        const scriptRowsToSave = scriptRows
          .filter((row) => row.video.trim() || row.texto.trim())
          .map(({ id, video, texto }) => ({ id, video, texto }));

        let roteiroIdFinal = roteiro.id;

        if (roteiro.id === "temp") {
          // --- Lógica de CRIAÇÃO do Roteiro ---
          toast.loading("Criando novo roteiro...");
          const newRoteiroId = await createRoteiro(
            { scriptRows: scriptRowsToSave, pautaId: pauta.id },
            user.uid
          );

          if (!newRoteiroId) {
            throw new Error("Falha ao criar o novo roteiro.");
          }
          roteiroIdFinal = newRoteiroId;
          setRoteiro((prev) => ({ ...prev, id: roteiroIdFinal }));

          // Atualiza a pauta com o ID do roteiro recém-criado
          await updatePauta(
            pauta.id,
            { ...pautaDataToSave, roteiroId: roteiroIdFinal },
            user.uid
          );

          toast.success("Pauta e Roteiro criados e salvos!");
          navigate(-1);
        } else {
          // --- Lógica de EDIÇÃO ---
          await toast.promise(
            Promise.all([
              updatePauta(pauta.id, pautaDataToSave, user.uid),
              updateRoteiro(roteiroIdFinal, scriptRowsToSave, user.uid),
            ]),
            {
              loading: "Salvando alterações...",
              success: () => {
                navigate(-1);
                return "Pauta e Roteiro salvos com sucesso!";
              },
              error: "Erro ao salvar alterações.",
            }
          );
        }
      } else {
        // 3. SE O ROTEIRO FOR NULO (só salva a pauta)
        // O usuário só editou o BasicInfoCard
        await toast.promise(updatePauta(pauta.id, pautaDataToSave, user.uid), {
          loading: "Salvando alterações da pauta...",
          success: "Pauta salva com sucesso!",
          error: "Erro ao salvar pauta.",
        });
        navigate(-1);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar.", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Carregando roteiro..." />;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{pauta?.titulo || "Roteiro"}</h1>
          <p className="text-lg text-muted-foreground">
            {mode === "edit" ? "Modo de Edição" : "Modo de Visualização"}
          </p>
        </div>
      </div>
      <BasicInfoCard
        formData={pauta}
        onFormChange={handleInputChange}
        cidades={cidades}
        isReadOnly={isReadOnly}
        dateError={dateValidationError}
      />
      {roteiro ? (
        <DetailedScriptCard
          scriptRows={scriptRows}
          onAddRow={handleAddRow}
          onRemoveRow={handleRemoveRow}
          onUpdateRow={handleUpdateRow}
          isReadOnly={isReadOnly}
          pauta={pauta?.titulo}
          isAIAssistantLoading={isAIAssistantLoading}
          hasSuggestions={hasSuggestions}
          onAprimorar={() =>
            alert("Função 'Aprimorar' (IA) será conectada aqui.")
          }
        />
      ) : (
        // Se 'roteiro' for nulo, mostre o botão (se não for read-only)
        !isReadOnly && (
          <Card className="border-dashed border-slate-300">
            <CardContent className="p-6 text-center">
              <FilePlus className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-700">
                Roteiro Vazio
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                Esta pauta ainda não tem um roteiro. Adicione um roteirista e
                clique abaixo para começar
              </p>
              <Button
                type="button"
                onClick={handleAdicionarRoteiro}
                disabled={!pauta.roteiristaId}
              >
                Adicionar Roteiro
              </Button>
            </CardContent>
          </Card>
        )
      )}
      {/* 6. SÓ MOSTRE O BOTÃO "SALVAR" SE NÃO ESTIVER EM MODO DE LEITURA */}

      {!isReadOnly && (
        <div className="flex justify-end pt-4">
          <Button
            className="gap-2"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <Save className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      )}
    </div>
  );
}
