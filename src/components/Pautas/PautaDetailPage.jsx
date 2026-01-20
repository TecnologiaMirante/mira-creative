// /src/components/pautas/PautaDetailPage.jsx

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getPauta,
  getRoteiro,
  updateRoteiro,
  updatePauta,
  createRoteiro,
  emailEdicaoPauta,
  notificarEdicaoPauta,
  notificarCriacaoRoteiro,
  notificarEdicaoRoteiro,
} from "@infra/firebase";
import { LoadingOverlay } from "../LoadingOverlay";
import UserContext from "@/context/UserContext";
import { ArrowLeft, Save, FilePlus, FileDown, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { BasicInfoCard } from "../Card/BasicInfoCard";
import { DetailedScriptCard } from "../Card/DetailedScriptCard ";
import { Card, CardContent } from "../ui/card";
import { useUserCache } from "@/context/UserCacheContext";
import { exportScriptToPDF } from "@/lib/exportUtils";

export function PautaDetailPage() {
  const { user } = useContext(UserContext);
  const { id: pautaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getUserById } = useUserCache();

  const mode = location.pathname.includes("/edit") ? "edit" : "view";
  const isReadOnly = mode === "view";

  const [pauta, setPauta] = useState(null);
  const [originalPauta, setOriginalPauta] = useState(null);
  const [roteiro, setRoteiro] = useState(null);
  const [scriptRows, setScriptRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [cidades, setCidades] = useState([]);
  const [dateValidationError, setDateValidationError] = useState("");

  const [isAIAssistantLoading, setIsAIAssistantLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const pautaData = await getPauta(pautaId);
      if (!pautaData) {
        toast.error("Pauta não encontrada."), { duration: 1500 };
        navigate("/home/pautas");
        return;
      }

      const produtor = pautaData.produtorId
        ? getUserById(pautaData.produtorId)
        : null;

      const apresentador = pautaData.apresentadorId
        ? getUserById(pautaData.apresentadorId)
        : null;

      const roteirista = pautaData.roteiristaId
        ? getUserById(pautaData.roteiristaId)
        : null;

      const formattedPauta = {
        id: pautaId,
        ...pautaData,
        program: pautaData.program || location.state?.programaNome || "—",
        produtorNome: produtor?.display_name || null,
        apresentadorNome: apresentador?.display_name || null,
        roteiristaNome: roteirista?.display_name || null,
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
      setOriginalPauta(structuredClone(formattedPauta));

      if (pautaData.roteiroId) {
        const roteiroData = await getRoteiro(pautaData.roteiroId);

        if (roteiroData) {
          setRoteiro(roteiroData);
          setScriptRows(
            roteiroData.scriptRows?.length
              ? roteiroData.scriptRows
              : [{ id: uuidv4(), video: "", texto: "" }]
          );
        } else {
          toast.error(`Roteiro (ID: ${pautaData.roteiroId}) não encontrado.`),
            { duration: 1500 };
          setPauta((prev) => ({ ...prev, roteiroId: null }));
          setRoteiro(null);
        }
      } else {
        setRoteiro(null);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [pautaId, navigate, getUserById]);

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

  const handleInputChange = (field, value) => {
    setPauta((prev) => {
      const newState = { ...prev, [field]: value };

      if (field === "dataGravacao") {
        if (value?.from) {
          newState.dataGravacaoInicio = value.from;
          newState.dataGravacaoFim = value.to || null;
        } else {
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
        duration: 1500,
      });
      return;
    }

    setRoteiro({ id: "temp", pautaId: pauta.id });
    setScriptRows([{ id: uuidv4(), video: "", texto: "" }]);
  };

  // Handler de sugestão de linha de roteiro
  const handleAcceptSuggestion = (id, field) => {
    setScriptRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id && row.suggestion[field]) {
          return {
            ...row,
            [field]: row.suggestion[field],
            suggestion: { ...row.suggestion, [field]: null },
          };
        }
        return row;
      })
    );
  };

  // Handler de rejeição de linha de roteiro
  const handleDeclineSuggestion = (id, field) => {
    setScriptRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          return {
            ...row,
            suggestion: { ...row.suggestion, [field]: null },
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
        if (newRow.suggestion.video) newRow.video = newRow.suggestion.video;
        if (newRow.suggestion.texto) newRow.texto = newRow.suggestion.texto;
        newRow.suggestion = { video: null, texto: null };
        return newRow;
      })
    );
  };

  //Handler de rejeição de todas as sugestões
  const handleDeclineAllSuggestions = () => {
    setScriptRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        suggestion: { video: null, texto: null },
      }))
    );
  };

  // Handler Principal da IA
  const handleAprimorarRoteiro = async () => {
    // 1. VALIDAÇÃO PRÉVIA: Verifica se tem algo escrito para aprimorar
    const temConteudo = scriptRows.some(
      (row) => row.video.trim() || row.texto.trim()
    );

    if (!temConteudo) {
      toast.warning("O roteiro está vazio!", {
        description:
          "Escreva pelo menos um rascunho para a IA poder aprimorar.",
        duration: 1500,
      });
      return;
    }
    setIsAIAssistantLoading(true);

    const scriptDataForAI = scriptRows.map((row) => ({
      id: row.id,
      video: row.video,
      texto: row.texto,
    }));

    const prompt = `
Você é um redator sênior especializado em aprimorar roteiros jornalísticos de TV.
Seu papel é *elevar a qualidade do texto* sem alterar fatos e sem reescrever tudo do zero.

Título da pauta: "${pauta.titulo}"

🟨 OBJETIVO
Para cada linha do roteiro, você deve melhorar:
- clareza
- força narrativa
- precisão
- naturalidade
- impacto
- relevância jornalística
- contextualização leve (sem criar fatos)

🟥 REGRAS IMPORTANTES
1. Não invente fatos, números, eventos ou personagens.
2. Mantenha a intenção original da frase.
3. Você pode aprofundar significado, contexto geral ou leitura social do tema,
   desde que não crie informações novas.
4. Não altere nomes de pessoas, locais ou instituições.
5. Se a frase já estiver boa, devolva uma versão quase igual, apenas polida.
6. Nunca devolva sugestões vazias.

🟧 REGRAS ESPECÍFICAS PARA O CAMPO VÍDEO
- Nunca escreva frases completas.
- NÃO interprete, NÃO opine e NÃO explique o tema.
- Descreva SOMENTE imagens possíveis de serem captadas pela câmera.
- Seja objetivo e visual.
- Nada de análise social, moral ou política.
- Deve ser sempre descrição visual: ambientes, pessoas, ações, objetos, movimentos, enquadramentos.
- Ex.: “crianças na sala de aula”, “professora explicando no quadro”, “fachada da escola”.

🟦 COMO APROFUNDAR (SEM INVENTAR)
- tornar a frase mais clara e expressiva
- dar mais propósito ou contexto *genérico* (ex.: impacto, relevância, importância, consequências naturais)
- reforçar o sentido do que já está dito
- melhorar ritmo, fluidez e escolha de palavras
- destacar humanidade, serviço, interesse público ou utilidade, quando fizer sentido
- evitar exageros e frases genéricas demais

🟩 ESTILO:
- jornalístico
- direto, porém humano
- natural para locução de TV
- firme, claro e objetivo
- sem sensacionalismo

🟦 FORMATO OBRIGATÓRIO DE RESPOSTA:
{
  "sugestoes": [
    {
      "id": "ID_DA_LINHA",
      "video_suggestion": "Descrição visual objetiva para o vídeo, sem análises ou opiniões."
      "texto_suggestion": "Sugestão melhorada para o campo texto"
    }
  ]
}

🟦 ROTEIRO PARA ANÁLISE:
${JSON.stringify(scriptDataForAI, null, 2)}
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
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "Você é um assistente que retorna estritamente JSON.",
              },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        }
      );

      if (!response.ok) throw new Error(`Erro da API: ${response.statusText}`);

      const data = await response.json();

      // --- PROTEÇÃO CONTRA RESPOSTAS VAZIAS ---
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error("A IA não retornou nenhuma resposta válida.");
      }

      let responseContent;
      try {
        responseContent = JSON.parse(data.choices[0].message.content);
      } catch (e) {
        throw new Error("A resposta da IA não é um JSON válido.");
      }

      // 2. TRATAMENTO DE ERRO DA IA (Feedback)
      // Se a IA retornou "feedback" em vez de "sugestoes" (como aconteceu com você)
      if (responseContent.feedback) {
        toast.warning("Aviso da IA: ", {
          description: responseContent.feedback,
          duration: 1500,
        });
        return;
      }

      // --- PROTEÇÃO CONTRA FORMATO ERRADO ---
      // Se 'sugestoes' não existir ou não for um array, cria um array vazio para não quebrar
      // Garante que é um array antes de prosseguir
      const suggestionsArray = Array.isArray(responseContent?.sugestoes)
        ? responseContent.sugestoes
        : [];

      if (suggestionsArray.length === 0) {
        toast.info("A IA analisou, mas não teve sugestões para este trecho."),
          { duration: 1500 };
        return;
      }

      setScriptRows((prevRows) =>
        prevRows.map((row) => {
          const suggestionForRow = suggestionsArray.find(
            (s) => String(s.id) === String(row.id)
          );
          if (suggestionForRow) {
            return {
              ...row,
              suggestion: {
                video: suggestionForRow.video_suggestion || null,
                texto: suggestionForRow.texto_suggestion || null,
              },
            };
          }
          return row;
        })
      );
      if (suggestionsArray.length > 0) {
        toast.success("Sugestões da IA carregadas!"), { duration: 1500 };
      }
    } catch (error) {
      console.error("Falha ao chamar a API da OpenAI:", error);
      toast.error("Erro ao buscar sugestões."), { duration: 1500 };
    } finally {
      setIsAIAssistantLoading(false);
    }
  };

  // Função para detectar mudanças no objeto
  const detectarMudancas = (novo, velho) => {
    const mudancas = [];
    if (!velho) return mudancas;

    // campos simples
    const campos = [
      "titulo",
      "status",
      "produtorId",
      "apresentadorId",
      "roteiristaId",
      "cidade",
      "bairro",
      "duracaoMinutos",
      "duracaoSegundos",
      "motivoCancelamento",
    ];

    campos.forEach((campo) => {
      if (JSON.stringify(novo[campo]) !== JSON.stringify(velho[campo])) {
        mudancas.push(campo);
      }
    });

    // campos de data
    const datas = [
      "dataGravacaoInicio",
      "dataGravacaoFim",
      "dataExibicao",
      "dataCancelamento",
    ];

    datas.forEach((campo) => {
      const n = novo[campo] instanceof Date ? novo[campo].getTime() : null;
      const o = velho[campo] instanceof Date ? velho[campo].getTime() : null;

      if (n !== o) mudancas.push(campo);
    });

    return mudancas;
  };

  // Função para pegar IDs de envolvidos na Pauta
  const getInvolvedUserIds = (data) => {
    const ids = [
      data.produtorId,
      data.apresentadorId,
      data.roteiristaId,
      // user.uid, // Descomentar se  quem criou também receba a notificação
    ];
    // Filtra IDs vazios/nulos e remove duplicatas
    return [...new Set(ids.filter((id) => id))];
  };

  // Handler de salvar
  const handleSaveChanges = async () => {
    if (!pauta || !user) {
      toast.error("Erro: Dados da pauta ou usuário não carregados."),
        { duration: 1500 };
      return;
    }
    if (dateValidationError) {
      toast.error("Erro de Validação", { description: dateValidationError }),
        { duration: 1500 };
      return;
    }

    setIsSaving(true);

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

    const mudancas = detectarMudancas(pauta, originalPauta);

    const labelDicionario = {
      titulo: "Título",
      produtorId: "Produtor",
      apresentadorId: "Apresentador",
      roteiristaId: "Roteirista",
      cidade: "Cidade",
      bairro: "Bairro",
      dataGravacaoInicio: "Data de Gravação",
      dataGravacaoFim: "Fim da Gravação",
      dataExibicao: "Data de Exibição",
      duracaoMinutos: "Duração",
      duracaoSegundos: "Duração",
      status: "Status",
      motivoCancelamento: "Motivo do Cancelamento",
      dataCancelamento: "Data do Cancelamento",
    };

    // converte IDs para nomes bonitos
    const converterValor = (campo, valor) => {
      if (!valor) return "";

      if (["produtorId", "apresentadorId", "roteiristaId"].includes(campo)) {
        return getUserById(valor)?.display_name || "(Usuário não encontrado)";
      }

      if (valor instanceof Date) {
        return valor.toLocaleDateString("pt-BR");
      }

      return valor;
    };

    // montar o array FINAL de mudanças com antes/depois já convertidos
    const detalhesConvertidos = mudancas.map((campo) => ({
      campo: labelDicionario[campo] || campo,
      antes: converterValor(campo, originalPauta[campo]),
      depois: converterValor(campo, pauta[campo]),
    }));

    // Filtro extra: Remove duplicatas se "duracaoMinutos" e "duracaoSegundos" mudaram juntos
    // para não aparecer "Duração, Duração" na notificação
    const detalhesUnicos = detalhesConvertidos.filter(
      (obj, index, self) =>
        index === self.findIndex((t) => t.campo === obj.campo)
    );

    const userIdsParaNotificar = getInvolvedUserIds(pauta);
    const userName = user.display_name || user.email || "Usuário";

    if (mudancas.length > 0) {
      const emails = [
        getUserById(pauta.produtorId)?.email,
        getUserById(pauta.apresentadorId)?.email,
        getUserById(pauta.roteiristaId)?.email,
      ].filter(Boolean);

      const emailsUnicos = [...new Set(emails)];

      notificarEdicaoPauta(
        pauta,
        userIdsParaNotificar,
        userName,
        detalhesUnicos
      );

      if (emailsUnicos.length > 0) {
        emailEdicaoPauta(
          emailsUnicos,
          pauta.titulo,
          pauta.id,
          detalhesConvertidos,
          originalPauta,
          pauta
        ).catch(console.error);
      }
    }
    try {
      if (roteiro) {
        const scriptRowsToSave = scriptRows
          .filter((row) => row.video.trim() || row.texto.trim())
          .map(({ id, video, texto }) => ({ id, video, texto }));

        let roteiroIdFinal = roteiro.id;

        if (roteiro.id === "temp") {
          const toastId = toast.loading("Criando novo roteiro...", {
            duration: 1500,
          });

          const newRoteiroId = await createRoteiro(
            { scriptRows: scriptRowsToSave, pautaId: pauta.id },
            user.uid
          );

          if (!newRoteiroId) {
            throw new Error("Falha ao criar o novo roteiro.");
          }

          const roteiroCriado = {
            id: newRoteiroId,
            pautaId: pauta.id,
          };

          // 🔔 NOTIFICAÇÃO DE CRIAÇÃO DE ROTEIRO
          await notificarCriacaoRoteiro(
            roteiroCriado,
            pauta.titulo,
            userIdsParaNotificar,
            userName
          );

          roteiroIdFinal = newRoteiroId;
          setRoteiro((prev) => ({ ...prev, id: roteiroIdFinal }));

          await updatePauta(
            pauta.id,
            { ...pautaDataToSave, roteiroId: roteiroIdFinal },
            user.uid
          );

          setOriginalPauta(
            structuredClone({ ...pauta, roteiroId: roteiroIdFinal })
          );

          toast.success("Pauta e Roteiro criados e salvos!", {
            id: toastId,
            duration: 1500,
          });

          navigate(-1);
        } else {
          await toast.promise(
            Promise.all([
              updatePauta(pauta.id, pautaDataToSave, user.uid),
              updateRoteiro(roteiro.id, scriptRowsToSave, user.uid),
            ]),
            {
              loading: "Salvando alterações...",
              success: () => {
                navigate(-1);
                return "Pauta e Roteiro salvos com sucesso!";
              },
              error: "Erro ao salvar alterações.",
              duration: 1500,
            }
          );
          await notificarEdicaoRoteiro(
            {
              id: roteiro.id,
              pautaId: pauta.id,
            },
            pauta.titulo,
            userIdsParaNotificar,
            userName
          );
          setOriginalPauta(
            structuredClone({ ...pauta, roteiroId: roteiroIdFinal })
          );
          navigate(-1);
        }
      } else {
        await toast.promise(updatePauta(pauta.id, pautaDataToSave, user.uid), {
          loading: "Salvando alterações da pauta...",
          success: "Pauta salva com sucesso!",
          error: "Erro ao salvar pauta.",
          duration: 1500,
        });

        navigate(-1);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar.", {
        description: error.message,
        duration: 1500,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handler de Exportar PDF
  const handleExportPDF = async () => {
    if (!pauta) return;
    setIsExporting(true);

    // Mapeia os nomes corretos para o PDF
    const pdfData = {
      ...pauta,
      produtor: pauta.produtorNome, // Mapeia Produtor
      apresentador: pauta.apresentadorNome, // Mapeia Apresentador
      roteirista: pauta.roteiristaNome, // Mapeia Roteirista (NOVO)
      // Os campos de duração e data já existem dentro de '...pauta'
    };

    await exportScriptToPDF(pdfData, scriptRows);
    setIsExporting(false);
  };

  if (isLoading) {
    return <LoadingOverlay message="Carregando roteiro..." />;
  }

  const hasSuggestions = scriptRows.some(
    (row) => row.suggestion?.video || row.suggestion?.texto
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
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

        <div className="flex flex-row gap-2">
          {user?.typeUser !== "Visualizador" && (
            <Button
              variant="outline"
              className="gap-2 border-slate-300"
              onClick={() => navigate(`/home/pautas/edit/${pautaId}`)}
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2 border-slate-300"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <FileDown className="h-4 w-4" />
            {isExporting ? "Gerando PDF..." : "Exportar PDF"}
          </Button>
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
          onAprimorar={handleAprimorarRoteiro}
          onAcceptAllSuggestions={handleAcceptAllSuggestions}
          onDeclineAllSuggestions={handleDeclineAllSuggestions}
          onAcceptSuggestion={handleAcceptSuggestion}
          onDeclineSuggestion={handleDeclineSuggestion}
        />
      ) : (
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
