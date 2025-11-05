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
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { BasicInfoCard } from "../Card/BasicInfoCard";
import { DetailedScriptCard } from "../Card/DetailedScriptCard ";

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
        dataGravacao: pautaData.dataGravacao
          ? pautaData.dataGravacao.toDate()
          : null,
        dataExibicao: pautaData.dataExibicao
          ? pautaData.dataExibicao.toDate()
          : null,
        dataCancelamento: pautaData.dataCancelamento
          ? pautaData.dataCancelamento.toDate()
          : null,
      };
      setPauta(formattedPauta);

      // 2. Buscar o Roteiro
      if (!pautaData.roteiroId) {
        console.log("Esta pauta ainda não tem um roteiro. (Criar fluxo)");
        setRoteiro({ id: "temp", pautaId: pautaData.id });
        setScriptRows([{ id: uuidv4(), video: "", texto: "" }]);
      } else {
        const roteiroData = await getRoteiro(pautaData.roteiroId);
        if (roteiroData) {
          setRoteiro(roteiroData);
          setScriptRows(
            roteiroData.scriptRows?.length > 0
              ? roteiroData.scriptRows
              : [{ id: uuidv4(), video: "", texto: "" }]
          );
        } else {
          toast.error(`Roteiro (ID: ${pautaData.roteiroId}) não encontrado.`);
        }
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

  // useEffect de Validação de Data (copiado do ScriptForm)
  useEffect(() => {
    if (pauta?.dataGravacao && pauta?.dataExibicao) {
      if (pauta.dataExibicao < pauta.dataGravacao) {
        setDateValidationError(
          "A data de exibição não pode ser anterior à data de gravação."
        );
      } else {
        setDateValidationError("");
      }
    } else {
      setDateValidationError("");
    }
  }, [pauta?.dataGravacao, pauta?.dataExibicao]);

  // Handler de Input (copiado do ScriptForm)
  const handleInputChange = (field, value) => {
    setPauta((prev) => {
      const newState = { ...prev, [field]: value };
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

  // Handler para Salvar (ambos os documentos)
  const handleSaveChanges = async () => {
    if (!pauta || !roteiro || !user) {
      toast.error("Erro: Dados não carregados.");
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
      dataGravacao: pauta.dataGravacao,
      dataExibicao: pauta.dataExibicao,
      status: pauta.status,
      motivoCancelamento: pauta.motivoCancelamento || "",
      dataCancelamento: pauta.dataCancelamento || null,
    };

    // Prepara os dados do Roteiro
    const scriptRowsToSave = scriptRows
      .filter((row) => row.video.trim() || row.texto.trim())
      .map(({ id, video, texto }) => ({ id, video, texto }));

    try {
      let roteiroIdFinal = roteiro.id;

      // --- Lógica de CRIAÇÃO ---
      if (roteiro.id === "temp") {
        toast.loading("Criando novo roteiro...");
        const newRoteiroId = await createRoteiro(
          {
            scriptRows: scriptRowsToSave,
            pautaId: pauta.id,
          },
          user.uid
        );

        if (!newRoteiroId) {
          throw new Error("Falha ao criar o novo roteiro.");
        }
        roteiroIdFinal = newRoteiroId;

        setRoteiro((prev) => ({ ...prev, id: roteiroIdFinal }));

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
    } catch (error) {
      console.error("Erro ao salvar:", error);
      if (roteiro.id === "temp") {
        toast.error("Erro ao criar novo roteiro.", {
          description: error.message,
        });
      }
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
      {!isReadOnly && (
        <div className="flex justify-end gap-4">
          {" "}
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
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
