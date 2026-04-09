import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Eye,
  FileDown,
  FilePlus,
  Save,
  Sparkles,
} from "lucide-react";

import UserContext from "@/context/UserContext";
import { useUserCache } from "@/context/UserCacheContext";
import { exportScriptToPDF } from "@/lib/exportUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "../ui/card";
import { LoadingOverlay } from "../LoadingOverlay";
import { BasicInfoCard } from "../Card/BasicInfoCard";
import { DetailedScriptCard } from "../Card/DetailedScriptCard ";
import {
  createRoteiro,
  emailEdicaoPauta,
  getPauta,
  getPrograma,
  getRoteiro,
  notificarCriacaoRoteiro,
  notificarEdicaoPauta,
  notificarEdicaoRoteiro,
  removePautaFromEspelho,
  updatePauta,
  updateRoteiro,
} from "../../../firebaseClient";

export function PautaDetailPage() {
  const { user } = useContext(UserContext);
  const { id: pautaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getUserById } = useUserCache();

  const mode = location.pathname.includes("/edit") ? "edit" : "view";
  const isReadOnly = mode === "view";

  const [pauta, setPauta] = useState(null);
  const [nomePrograma, setNomePrograma] = useState("Carregando...");
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

      try {
        // 1. Busca a pauta principal
        const pautaData = await getPauta(pautaId);

        if (!pautaData) {
          toast.error("Pauta não encontrada.", { duration: 1500 });
          navigate("/home/pautas");
          return;
        }

        let programName = "Programa não vinculado";

        if (pautaData.programaId) {
          const programaData = await getPrograma(pautaData.programaId);
          programName = programaData?.nome || "Programa não encontrado";
        }

        setNomePrograma(programName);

        const produtor = pautaData.produtorId
          ? getUserById(pautaData.produtorId)
          : null;
        const apresentador = pautaData.apresentadorId
          ? getUserById(pautaData.apresentadorId)
          : null;
        const roteirista = pautaData.roteiristaId
          ? getUserById(pautaData.roteiristaId)
          : null;

        // Formata a pauta
        const formattedPauta = {
          id: pautaId,
          ...pautaData,
          programaId:
            pautaData.programaId || location.state?.programaNome || "—",
          programaNome: programName,
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
          pendingProgramUnlink: false,
        };

        setPauta(formattedPauta);
        setOriginalPauta(structuredClone(formattedPauta));

        // Busca o Roteiro
        if (pautaData.roteiroId) {
          const roteiroData = await getRoteiro(pautaData.roteiroId);

          if (roteiroData) {
            setRoteiro(roteiroData);
            setScriptRows(
              roteiroData.scriptRows?.length
                ? roteiroData.scriptRows
                : [{ id: uuidv4(), video: "", texto: "" }],
            );
          } else {
            toast.error(
              `Roteiro (ID: ${pautaData.roteiroId}) não encontrado.`,
              {
                duration: 1500,
              },
            );
            setPauta({ ...formattedPauta, roteiroId: null });
            setRoteiro(null);
          }
        } else {
          setRoteiro(null);
        }
      } catch (error) {
        console.error("Erro ao buscar dados da pauta:", error);
        toast.error("Erro ao carregar os dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getUserById, location.state?.programaNome, navigate, pautaId]);

  useEffect(() => {
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados/21/municipios",
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
    if (dataInicio && pauta?.dataExibicao && pauta.dataExibicao < dataInicio) {
      setDateValidationError(
        "A data de exibição não pode ser anterior à data de gravação.",
      );
      return;
    }

    setDateValidationError("");
  }, [pauta?.dataExibicao, pauta?.dataGravacaoInicio]);

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
        row.id === rowId ? { ...row, [field]: value } : row,
      ),
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
          "Você deve primeiro salvar um roteirista antes de adicionar um roteiro.",
        duration: 1500,
      });
      return;
    }

    setRoteiro({ id: "temp", pautaId: pauta.id });
    setScriptRows([{ id: uuidv4(), video: "", texto: "" }]);
  };

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
      }),
    );
  };

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
      }),
    );
  };

  const handleAcceptAllSuggestions = () => {
    setScriptRows((prevRows) =>
      prevRows.map((row) => {
        const newRow = { ...row };
        if (newRow.suggestion?.video) newRow.video = newRow.suggestion.video;
        if (newRow.suggestion?.texto) newRow.texto = newRow.suggestion.texto;
        newRow.suggestion = { video: null, texto: null };
        return newRow;
      }),
    );
  };

  const handleDeclineAllSuggestions = () => {
    setScriptRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        suggestion: { video: null, texto: null },
      })),
    );
  };

  const handleAprimorarRoteiro = async () => {
    const temConteudo = scriptRows.some(
      (row) => row.video.trim() || row.texto.trim(),
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
Seu papel é elevar a qualidade do texto sem alterar fatos e sem reescrever tudo do zero.

Título da pauta: "${pauta.titulo}"

OBJETIVO
Para cada linha do roteiro, você deve melhorar:
- clareza
- força narrativa
- precisão
- naturalidade
- impacto
- relevância jornalística
- contextualização leve (sem criar fatos)

REGRAS IMPORTANTES
1. Não invente fatos, números, eventos ou personagens.
2. Mantenha a intenção original da frase.
3. Você pode aprofundar significado, contexto geral ou leitura social do tema, desde que não crie informações novas.
4. Não altere nomes de pessoas, locais ou instituições.
5. Se a frase já estiver boa, devolva uma versão quase igual, apenas polida.
6. Nunca devolva sugestões vazias.

REGRAS ESPECÍFICAS PARA O CAMPO VÍDEO
- Nunca escreva frases completas.
- Não interprete, não opine e não explique o tema.
- Descreva somente imagens possíveis de serem captadas pela câmera.
- Seja objetivo e visual.
- Nada de análise social, moral ou política.
- Deve ser sempre descrição visual: ambientes, pessoas, ações, objetos, movimentos, enquadramentos.

ESTILO
- jornalístico
- direto, porém humano
- natural para locução de TV
- firme, claro e objetivo
- sem sensacionalismo

FORMATO OBRIGATÓRIO DE RESPOSTA:
{
  "sugestoes": [
    {
      "id": "ID_DA_LINHA",
      "video_suggestion": "Descrição visual objetiva",
      "texto_suggestion": "Sugestão melhorada para o campo texto"
    }
  ]
}

ROTEIRO PARA ANÁLISE:
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
        },
      );

      if (!response.ok) {
        throw new Error(`Erro da API: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error("A IA não retornou nenhuma resposta válida.");
      }

      let responseContent;
      try {
        responseContent = JSON.parse(data.choices[0].message.content);
      } catch {
        throw new Error("A resposta da IA não é um JSON válido.");
      }

      if (responseContent.feedback) {
        toast.warning("Aviso da IA", {
          description: responseContent.feedback,
          duration: 1500,
        });
        return;
      }

      const suggestionsArray = Array.isArray(responseContent?.sugestoes)
        ? responseContent.sugestoes
        : [];

      if (suggestionsArray.length === 0) {
        toast.info("A IA analisou, mas não teve sugestões para este trecho.", {
          duration: 1500,
        });
        return;
      }

      setScriptRows((prevRows) =>
        prevRows.map((row) => {
          const suggestionForRow = suggestionsArray.find(
            (s) => String(s.id) === String(row.id),
          );
          if (!suggestionForRow) return row;
          return {
            ...row,
            suggestion: {
              video: suggestionForRow.video_suggestion || null,
              texto: suggestionForRow.texto_suggestion || null,
            },
          };
        }),
      );

      toast.success("Sugestões da IA carregadas!", { duration: 1500 });
    } catch (error) {
      console.error("Falha ao chamar a API da OpenAI:", error);
      toast.error("Erro ao buscar sugestões.", { duration: 1500 });
    } finally {
      setIsAIAssistantLoading(false);
    }
  };

  const detectarMudancas = (novo, velho) => {
    const mudancas = [];
    if (!velho) return mudancas;

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

  const getInvolvedUserIds = (data) => [
    ...new Set(
      [data.produtorId, data.apresentadorId, data.roteiristaId].filter(Boolean),
    ),
  ];

  const handleSaveChanges = async () => {
    if (!pauta || !user) {
      toast.error("Erro: dados da pauta ou usuário não carregados.", {
        duration: 1500,
      });
      return;
    }

    if (dateValidationError) {
      toast.error("Erro de validação", {
        description: dateValidationError,
        duration: 1500,
      });
      return;
    }

    setIsSaving(true);

    const pautaDataToSave = {
      // program: pauta.program,
      produtorId: pauta.produtorId,
      apresentadorId: pauta.apresentadorId,
      roteiristaId: pauta.roteiristaId,
      programaId: pauta.programaId || null,
      espelhoId: pauta.espelhoId || null,
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

    const detalhesConvertidos = mudancas.map((campo) => ({
      campo: labelDicionario[campo] || campo,
      antes: converterValor(campo, originalPauta[campo]),
      depois: converterValor(campo, pauta[campo]),
    }));

    const detalhesUnicos = detalhesConvertidos.filter(
      (obj, index, self) =>
        index === self.findIndex((t) => t.campo === obj.campo),
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
        detalhesUnicos,
      );

      if (emailsUnicos.length > 0) {
        emailEdicaoPauta(
          emailsUnicos,
          pauta.titulo,
          pauta.id,
          detalhesConvertidos,
          originalPauta,
          pauta,
        ).catch(console.error);
      }
    }

    try {
      if (
        pauta.pendingProgramUnlink &&
        originalPauta?.programaId &&
        originalPauta?.espelhoId
      ) {
        const unlinkSuccess = await removePautaFromEspelho(
          originalPauta.espelhoId,
          { ...originalPauta, ...pauta },
          originalPauta.programaId,
        );

        if (!unlinkSuccess) {
          throw new Error("Não foi possível desvincular a pauta do programa.");
        }
      }

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
            user.uid,
          );

          if (!newRoteiroId) {
            throw new Error("Falha ao criar o novo roteiro.");
          }

          const roteiroCriado = { id: newRoteiroId, pautaId: pauta.id };

          await notificarCriacaoRoteiro(
            roteiroCriado,
            pauta.titulo,
            userIdsParaNotificar,
            userName,
          );

          roteiroIdFinal = newRoteiroId;
          setRoteiro((prev) => ({ ...prev, id: roteiroIdFinal }));

          await updatePauta(
            pauta.id,
            {
              ...pautaDataToSave,
              roteiroId: roteiroIdFinal,
              pendingProgramUnlink: false,
            },
            user.uid,
          );

          setOriginalPauta(
            structuredClone({ ...pauta, roteiroId: roteiroIdFinal }),
          );

          toast.success("Pauta e roteiro criados e salvos!", {
            id: toastId,
            duration: 1500,
          });

          navigate(-1);
        } else {
          await toast.promise(
            Promise.all([
              updatePauta(
                pauta.id,
                { ...pautaDataToSave, pendingProgramUnlink: false },
                user.uid,
              ),
              updateRoteiro(roteiro.id, scriptRowsToSave, user.uid),
            ]),
            {
              loading: "Salvando alterações...",
              success: () => {
                navigate(-1);
                return "Pauta e roteiro salvos com sucesso!";
              },
              error: "Erro ao salvar alterações.",
              duration: 1500,
            },
          );

          await notificarEdicaoRoteiro(
            { id: roteiro.id, pautaId: pauta.id },
            pauta.titulo,
            userIdsParaNotificar,
            userName,
          );

          setOriginalPauta(
            structuredClone({ ...pauta, roteiroId: roteiroIdFinal }),
          );
          navigate(-1);
        }
      } else {
        await toast.promise(
          updatePauta(
            pauta.id,
            { ...pautaDataToSave, pendingProgramUnlink: false },
            user.uid,
          ),
          {
            loading: "Salvando alterações da pauta...",
            success: "Pauta salva com sucesso!",
            error: "Erro ao salvar pauta.",
            duration: 1500,
          },
        );

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

  const handleExportPDF = async () => {
    if (!pauta) return;
    setIsExporting(true);

    const pdfData = {
      ...pauta,
      produtor: pauta.produtorNome,
      apresentador: pauta.apresentadorNome,
      roteirista: pauta.roteiristaNome,
    };

    await exportScriptToPDF(pdfData, scriptRows);
    setIsExporting(false);
  };

  if (isLoading) {
    return <LoadingOverlay message="Carregando roteiro..." />;
  }

  const hasSuggestions = scriptRows.some(
    (row) => row.suggestion?.video || row.suggestion?.texto,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.97),_rgba(248,250,252,0.97))] p-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.45)] sm:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              className="mt-1 h-11 w-11 rounded-2xl border-slate-200 bg-white/90 shadow-sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-700">
                {mode === "edit" ? (
                  <Sparkles className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                {mode === "edit" ? "Modo de edição" : "Modo de visualização"}
              </span>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  {pauta?.titulo || "Roteiro"}
                </h1>
                <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
                  Visualize, revise e refine a pauta com uma leitura mais clara
                  para operação, roteiro e aprovação.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Programa
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {nomePrograma || "Não vinculado"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Exibição
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {pauta?.dataExibicao
                    ? pauta.dataExibicao.toLocaleDateString("pt-BR")
                    : "Sem data"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Status
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {pauta?.status || "Não definido"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {user?.typeUser !== "Visualizador" && (
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl border-slate-300 bg-white/90"
                  onClick={() => navigate(`/home/pautas/edit/${pautaId}`)}
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              )}
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-slate-300 bg-white/90"
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                <FileDown className="h-4 w-4" />
                {isExporting ? "Gerando PDF..." : "Exportar PDF"}
              </Button>
            </div>
          </div>
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
          <Card className="border-dashed border-slate-300 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.96))] shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <FilePlus className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">
                Roteiro vazio
              </h3>
              <p className="mx-auto mb-5 mt-2 max-w-xl text-sm text-slate-500">
                Esta pauta ainda não tem um roteiro. Adicione um roteirista e
                comece a estruturar o conteúdo com o mesmo padrão visual do
                restante do sistema.
              </p>
              <Button
                type="button"
                onClick={handleAdicionarRoteiro}
                disabled={!pauta.roteiristaId}
                className="rounded-xl px-5"
              >
                Adicionar Roteiro
              </Button>
            </CardContent>
          </Card>
        )
      )}

      {!isReadOnly && (
        <div className="sticky bottom-4 z-20 flex justify-end pt-2">
          <Button
            className="h-12 gap-2 rounded-2xl px-6 shadow-lg shadow-indigo-200/50"
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
