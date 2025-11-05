// /src/components/Card/ScriptForm.jsx

import { useState, useEffect, useContext } from "react";
import { db, createPauta, createRoteiro } from "../../../firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { BasicInfoCard } from "./BasicInfoCard";
import { DetailedScriptCard } from "./DetailedScriptCard ";
import { toast } from "sonner";
import { exportScriptToPDF } from "@/lib/exportUtils";
import { Save, ArrowLeft, Download } from "lucide-react";
import UserContext from "@/context/UserContext";
import { v4 as uuidv4 } from "uuid";
import { Navigate, useNavigate } from "react-router-dom";

// Estado inicial da linha
const initialScriptRow = {
  id: uuidv4(),
  video: "",
  texto: "",
  suggestion: { video: null, texto: null },
};

const initialState = {
  program: "Daqui",
  produtorId: "",
  cidade: "",
  bairro: "",
  titulo: "",
  apresentadorId: "",
  roteiristaId: "",
  dataGravacao: null,
  dataExibicao: null,
  status: "Em Produção",
  motivoCancelamento: "",
  dataCancelamento: null,
  isVisible: true,
};

export function ScriptForm({ onCancel, onSave, initialData, mode = "create" }) {
  const { user: user } = useContext(UserContext);
  const [formData, setFormData] = useState(initialState);
  const [scriptRows, setScriptRows] = useState([initialScriptRow]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIAssistantLoading, setIsAIAssistantLoading] = useState(false);
  const [cidades, setCidades] = useState([]);
  const isReadOnly = mode === "view";
  const [dateValidationError, setDateValidationError] = useState("");

  const navigate = useNavigate();

  // UseEffect para popular dados
  useEffect(() => {
    if ((mode === "edit" || mode === "view") && initialData) {
      const formattedData = {
        ...initialState,
        ...initialData,
        dataGravacao: initialData.dataGravacao
          ? new Date(`${initialData.dataGravacao}T00:00:00`)
          : null,
        dataExibicao: initialData.dataExibicao
          ? new Date(`${initialData.dataExibicao}T00:00:00`)
          : null,
        dataCancelamento: initialData.dataCancelamento
          ? new Date(`${initialData.dataCancelamento}T00:00:00`)
          : null,
      };
      setFormData(formattedData);

      // Garante que as linhas carregadas tenham a estrutura de suggestion
      const populatedRows =
        initialData.scriptRows?.length > 0
          ? initialData.scriptRows.map((row) => ({
              ...initialScriptRow, // Garante a estrutura completa
              ...row,
              id: row.id || Date.now().toString(), // Garante um ID
              suggestion: row.suggestion || { video: null, texto: null }, // Garante o objeto suggestion
            }))
          : [initialScriptRow]; // Se não houver linhas, começa com uma nova
      setScriptRows(populatedRows);
    } else {
      setFormData(initialState);
      setScriptRows([initialScriptRow]);
    }
  }, [initialData, mode]);

  // useEffect para carregar cidades do IBGE
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

  // useEffect para validar data de exibição
  useEffect(() => {
    // Verifica apenas se ambas as datas foram selecionadas
    if (formData.dataGravacao && formData.dataExibicao) {
      // Compara os objetos Date diretamente
      if (formData.dataExibicao < formData.dataGravacao) {
        setDateValidationError(
          "A data de exibição não pode ser anterior à data de gravação."
        );
      } else {
        setDateValidationError(""); // Limpa o erro se as datas forem válidas
      }
    } else {
      setDateValidationError(""); // Limpa o erro se uma das datas não estiver preenchida
    }
    // Roda toda vez que uma das datas mudar
  }, [formData.dataGravacao, formData.dataExibicao]);

  // Handler de input básico
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newState = { ...prev, [field]: value };
      if (field === "status" && value !== "Cancelado") {
        newState.motivoCancelamento = "";
        newState.dataCancelamento = "";
      }
      return newState;
    });
  };

  // Handlers de linha de roteiro
  const addScriptRow = () =>
    setScriptRows([
      ...scriptRows,
      {
        id: uuidv4(),
        video: "",
        texto: "",
        suggestion: { video: null, texto: null },
      },
    ]);

  const removeScriptRow = (id) =>
    setScriptRows(scriptRows.filter((row) => row.id !== id));

  const updateScriptRow = (id, field, value) => {
    setScriptRows(
      scriptRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  // Handler de sugestão de linha de roteiro
  const handleAcceptSuggestion = (id, field) => {
    setScriptRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id && row.suggestion[field]) {
          return {
            ...row,
            [field]: row.suggestion[field], // Aplica a sugestão
            suggestion: { ...row.suggestion, [field]: null }, // Limpa a sugestão específica
          };
        }
        return row;
      })
    );
  };

  // Handler de recusa de sugestão de linha de roteiro
  const handleDeclineSuggestion = (id, field) => {
    setScriptRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          return {
            ...row,
            suggestion: { ...row.suggestion, [field]: null }, // Apenas limpa a sugestão
          };
        }
        return row;
      })
    );
  };

  // Handler de aceitação de todas as sugestões
  const handleAcceptAllSuggestions = () => {
    setScriptRows((prevRows) =>
      prevRows.map((row) => {
        const newRow = { ...row };
        if (newRow.suggestion.video) {
          newRow.video = newRow.suggestion.video;
        }
        if (newRow.suggestion.texto) {
          newRow.texto = newRow.suggestion.texto;
        }
        // Limpa todas as sugestões da linha
        newRow.suggestion = { video: null, texto: null };
        return newRow;
      })
    );
  };

  // Handler de recusa de todas as sugestões
  const handleDeclineAllSuggestions = () => {
    setScriptRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        suggestion: { video: null, texto: null }, // Limpa todas
      }))
    );
  };

  // Handler de aprimoramento de roteiro
  const handleAprimorarRoteiro = async () => {
    setIsAIAssistantLoading(true);

    const scriptDataForAI = scriptRows.map((row) => ({
      id: row.id,
      video: row.video,
      texto: row.texto,
    }));

    // Prompt para o AI Assistant
    const prompt = `
    Você é um editor de roteiros de TV sênior e colaborativo. O tema geral da matéria é "${
      formData.titulo
    }".
    Analise o roteiro completo a seguir, que está em formato de array de objetos JSON.
    
    Roteiro completo:
    ${JSON.stringify(scriptDataForAI, null, 2)}

    Sua tarefa é analisar o tema e o roteiro para sugerir melhorias para CADA trecho.

    **REGRAS PARA AS SUGESTÕES:**

    **1. Para "video_suggestion" (O que mostrar):**
    * Este campo é para INSTRUÇÕES VISUAIS.
    * Se o campo "video" original estiver vazio, sugira o que mostrar [Use verbos no infinitivo, ex: "Mostrar a fachada do prédio...", "Inserir gráfico de..."]
    * Se o "video" original tiver conteúdo, sugira melhorias visuais [Use imperativo brando, ex: "Considere um close-up...", "Adicione um efeito de slow-motion...", "Aqui pode ser interessante um take aéreo..."].
    * Sempre que possível, indique trilhas sonoras, efeitos sonoros ou ângulos de câmera.

    **2. Para "texto_suggestion" (O que falar):**
    * Este campo deve conter a **FALA PRONTA** (narração, diálogo ou "passagem" do repórter).
    * **NÃO** dê instruções sobre o que dizer (Exemplo RUIM: "Tente adicionar uma frase sobre o impacto.").
    * **FAÇA:** Escreva a fala exata, como se fosse para o teleprompter (Exemplo BOM: "O impacto econômico é sentido diretamente no bolso do consumidor.").
    * Se o "texto" original estiver vazio, escreva uma fala que se encaixe na sugestão de vídeo.
    * Se o "texto" original tiver conteúdo, reescreva-o de forma mais clara, envolvente ou dinâmica, mantendo o estilo jornalístico.

    Lembre-se de manter a coerência com o tema proposto.

    Retorne sua resposta como um ÚNICO objeto JSON. Este objeto deve ter uma única chave chamada "sugestoes", que contém um array de objetos, mantendo o 'id' original de cada trecho. O formato de retorno deve ser estritamente o seguinte, sem nenhum texto adicional:
    {
      "sugestoes": [
        {
          "id": <id_original>,
          "video_suggestion": "<Sua INSTRUÇÃO VISUAL para o vídeo>",
          "texto_suggestion": "<Sua FALA PRONTA para a narração/diálogo>"
        }
      ]
    }
    `;

    const apiKey = import.meta.env.VITE_API_KEY_OPENAI;
    const organization = import.meta.env.VITE_API_ORG_OPENAI;
    const project = import.meta.env.VITE_API_PROJECT_OPENAI;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "OpenAI-Organization": organization,
            "OpenAI-Project": project,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo-1106",
            messages: [
              {
                role: "system",
                content:
                  "Sua resposta deve ser estritamente o objeto JSON solicitado...",
              },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erro da API: ${response.statusText} (${response.status})`
        );
      }

      const data = await response.json();
      // Validação básica da resposta
      if (
        !data.choices ||
        !data.choices[0] ||
        !data.choices[0].message ||
        !data.choices[0].message.content
      ) {
        throw new Error("Resposta da API inválida ou vazia.");
      }

      const responseContent = JSON.parse(data.choices[0].message.content);

      // Validação do conteúdo JSON
      if (!responseContent || !Array.isArray(responseContent.sugestoes)) {
        throw new Error(
          "Formato JSON de sugestões inválido na resposta da API."
        );
      }

      const suggestionsArray = responseContent.sugestoes;

      // Atualiza o estado com as sugestões
      setScriptRows((prevRows) =>
        prevRows.map((row) => {
          const suggestionForRow = suggestionsArray.find(
            (s) => String(s.id) === String(row.id)
          ); // Compara como string por segurança
          if (suggestionForRow) {
            return {
              ...row,
              suggestion: {
                video: suggestionForRow.video_suggestion || null, // Garante null se vazio
                texto: suggestionForRow.texto_suggestion || null,
              },
            };
          }
          return { ...row, suggestion: { video: null, texto: null } }; // Garante limpar sugestões antigas se não vier nova
        })
      );

      toast.success("Sugestões da IA carregadas!");
    } catch (error) {
      console.error("Falha ao chamar a API da OpenAI:", error);
      toast.error("Ocorreu um erro ao buscar as sugestões.", {
        description: error.message || "Verifique o console para mais detalhes.",
      });
    } finally {
      setIsAIAssistantLoading(false);
    }
  };

  // Handler de envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dateValidationError) {
      toast.error("Erro de Validação", { description: dateValidationError });
      return;
    }
    if (!user) {
      toast.error("Você não está autenticado.");
      return;
    }

    setIsLoading(true);

    // Separar dados da Pauta e do Roteiro
    const pautaData = {
      program: formData.program,
      produtorId: formData.produtorId,
      apresentadorId: formData.apresentadorId,
      roteiristaId: formData.roteiristaId,
      cidade: formData.cidade,
      bairro: formData.bairro,
      titulo: formData.titulo,
      dataGravacao: formData.dataGravacao,
      dataExibicao: formData.dataExibicao,
      status: formData.status,
      // ... (campos de cancelamento serão tratados se o status for 'Cancelado')
    };

    const roteiroData = {
      scriptRows: scriptRows
        .filter((row) => row.video.trim() || row.texto.trim())
        .map(({ id, video, texto }) => ({ id, video, texto })),
    };

    try {
      if (mode === "edit") {
        toast.error("Modo de edição ainda não refatorado.");
        setIsLoading(false);
      } else {
        // 1. Criar o Roteiro primeiro
        const newRoteiroId = await createRoteiro(roteiroData, user.uid);
        if (!newRoteiroId) {
          throw new Error("Falha ao criar o documento do roteiro.");
        }

        // 2. Criar a Pauta e vincular o ID do roteiro
        const pautaDataCompleta = {
          ...pautaData,
          roteiroId: newRoteiroId,
        };
        const newPautaId = await createPauta(pautaDataCompleta, user.uid);
        if (!newPautaId) {
          throw new Error("Falha ao criar o documento da pauta.");
        }

        navigate(-1);
        toast.success("Pauta e Roteiro criados com sucesso!", {
          duration: 3000,
        });
        onSave?.();
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Falha ao salvar.", {
        description: error.message || "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler de export PDF
  const handleExport = () => {
    exportScriptToPDF(formData, scriptRows);
  };

  // Helper para saber se há sugestões
  const hasSuggestions = scriptRows.some(
    (row) => row.suggestion.video || row.suggestion.texto
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onCancel} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {mode === "edit"
                ? "Editar Pauta"
                : mode === "view"
                ? "Visualizar Pauta"
                : "Criar Nova Pauta"}
            </h1>
          </div>
        </div>
        {isReadOnly && (
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <BasicInfoCard
          formData={formData}
          onFormChange={handleInputChange}
          cidades={cidades}
          isReadOnly={isReadOnly}
          dateError={dateValidationError}
        />
        <DetailedScriptCard
          scriptRows={scriptRows}
          onAddRow={addScriptRow}
          onRemoveRow={removeScriptRow}
          onUpdateRow={updateScriptRow}
          isReadOnly={isReadOnly}
          isAIAssistantLoading={isAIAssistantLoading}
          hasSuggestions={hasSuggestions}
          pauta={formData.titulo}
          onAprimorar={handleAprimorarRoteiro}
          onAcceptAllSuggestions={handleAcceptAllSuggestions}
          onDeclineAllSuggestions={handleDeclineAllSuggestions}
          onAcceptSuggestion={handleAcceptSuggestion}
          onDeclineSuggestion={handleDeclineSuggestion}
        />
        {!isReadOnly && (
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar Pauta"}{" "}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
