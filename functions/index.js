// functions/index.js

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");

initializeApp();
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

// Função auxiliar para formatar segundos em texto legível (MM:SS ou HH:MM:SS) para a IA entender
const formatarDuracao = (totalSegundos) => {
  if (!totalSegundos) return "00:00";
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  const minStr = String(minutos).padStart(2, "0");
  const segStr = String(segundos).padStart(2, "0");

  if (horas > 0) return `${horas}:${minStr}:${segStr}`;
  return `${minStr}:${segStr}`;
};

exports.askDaqui = onCall(
  {
    secrets: [GEMINI_API_KEY],
    region: "southamerica-east1",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Você precisa estar logado.");
    }

    const history = request.data.history || [];
    if (history.length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "Nenhuma pergunta foi fornecida."
      );
    }

    const userQuestion = history[history.length - 1].content;
    const conversationHistory = history.slice(0, -1);

    try {
      const db = getFirestore();

      // 1️⃣ USERS
      const usersSnapshot = await db.collection("users").get();
      const usersMap = Object.fromEntries(
        usersSnapshot.docs.map((doc) => [
          doc.id,
          doc.data().display_name || doc.data().nome || "Sem nome",
        ])
      );

      // 2️⃣ PROGRAMAS
      const programasSnapshot = await db
        .collection("programas")
        .where("isVisible", "==", true)
        .get();

      const programasData = programasSnapshot.docs.map((doc) => {
        const data = doc.data();
        const duracaoSegundos = data.duracaoTotalSegundos || 0;

        return {
          id: doc.id,
          nome: data.nome || "Sem nome",
          status: data.status || "Sem status",
          pautaCount: data.pautaCount || 0,
          duracaoSegundos: duracaoSegundos,
          duracaoLegivel: formatarDuracao(duracaoSegundos),
          dataExibicao:
            data.dataExibicao?.toDate?.()?.toLocaleString("pt-BR") ||
            "Sem data",
          editor: usersMap[data.editedBy] || "Desconhecido",
        };
      });

      const programasMap = Object.fromEntries(
        programasData.map((p) => [p.id, p.nome])
      );

      // 3️⃣ ESPELHOS
      const espelhosSnapshot = await db.collection("espelhos").get();
      const espelhosData = espelhosSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          programaId: data.programaId,
          pautasOrdenadas: data.pautasOrdenadas || [],
        };
      });

      // 4️⃣ PAUTAS
      const pautasSnapshot = await db
        .collection("pautas")
        .where("isVisible", "==", true)
        .get();

      const pautasData = pautasSnapshot.docs.map((doc) => {
        const data = doc.data();

        const min = parseInt(data.duracaoMinutos, 10) || 0;
        const seg = parseInt(data.duracaoSegundos, 10) || 0;
        const totalSeg = min * 60 + seg;

        return {
          id: doc.id,
          titulo: data.titulo || "Sem título",
          dataExibicao:
            data.dataExibicao?.toDate?.()?.toLocaleDateString("pt-BR") || null,
          programa: programasMap[data.programaId] || "Não vinculado",
          produtor: usersMap[data.produtorId] || "Não encontrado",
          apresentador: usersMap[data.apresentadorId] || "Não encontrado",
          roteirista: usersMap[data.roteiristaId] || "Não encontrado",
          status: data.status || "Sem status",
          duracaoTexto: `${String(min).padStart(2, "0")}:${String(seg).padStart(
            2,
            "0"
          )}`,
          duracaoEmSegundos: totalSeg,
          cidade: data.cidade || "",
          bairro: data.bairro || "",
        };
      });

      // 5️⃣ ROTEIROS
      const roteirosSnapshot = await db.collection("roteiros").get();
      const roteirosData = roteirosSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          pautaId: data.pautaId,
          resumo: (data.scriptRows || [])
            .map((row) => row.texto || "")
            .join(" ")
            .slice(0, 500),
        };
      });

      // 6️⃣ Juntar roteiros nas pautas
      const pautaComRoteiros = pautasData.map((pauta) => ({
        ...pauta,
        roteiros: roteirosData.filter((r) => r.pautaId === pauta.id),
      }));

      // 7️⃣ JSON final
      const contextData = JSON.stringify(
        {
          programas: programasData,
          espelhos: espelhosData,
          pautas: pautaComRoteiros,
        },
        null,
        2
      );

      // 8️⃣ Instrução do sistema
      const systemInstructionText = `
      Você é 'Daqui', um assistente inteligente especializado em análise de dados de uma produtora de TV.
      Você tem acesso aos dados via JSON fornecido no contexto.

      📊 ESTRUTURA DOS DADOS:
      - Programas: Contêm nome, data de exibição, status e duração total.
      - Pautas: Contêm título, equipe (produtor, roteirista, etc) e duração.
      - Roteiros: Conteúdo textual das pautas.

      🧠 REGRAS DE RACIOCÍNIO:
      1. **Fidelidade:** Use SOMENTE os dados fornecidos. Nunca invente. Se a informação não estiver no JSON, diga "Não encontrei essa informação nos dados disponíveis".
      2. **Dados Vazios:** Se um campo (como produtor ou roteirista) estiver marcado como "Não encontrado" ou "Sem nome", informe ao usuário que o dado não foi cadastrado, em vez de responder "Produzido por Não encontrado".
      3. **Durações:**
        - Para exibir: use sempre 'duracaoLegivel' (programas) ou 'duracaoTexto' (pautas).
        - Para calcular (somas ou comparações): use 'duracaoEmSegundos'.
      4. **Links (Crucial):**
        - Para pautas: [link:pautas/ID_DA_PAUTA]
        - Para programas: [link:programas/ID_DO_PROGRAMA]
        - NÃO gere links para roteiros ou espelhos.
        - Coloque o link sempre ao final da frase relevante.
      5. **Tempo Relativo:** Use a "Data atual" fornecida abaixo para saber se um programa é passado (já exibido) ou futuro (próximo).

      EXEMPLOS:
      - Pergunta: "Quanto tempo dura o programa Carnaval?"
        Resposta: "O programa Especial - Carnaval tem duração de 11:22 e será exibido em 22/11/2025. [link:programas/ID...]"
      
      - Pergunta: "Quais pautas falam de comida?"
        Resposta: "Encontrei a pauta 'Festival Gastronômico' (05:30), produzida por Victor Moura. [link:pautas/ID...]"

      Data atual: ${new Date().toLocaleString("pt-BR")}.
`;

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const geminiHistory = conversationHistory.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        systemInstruction: {
          role: "system",
          parts: [{ text: systemInstructionText }],
        },
        history: geminiHistory,
      });

      const result = await chat.sendMessage(
        "### CONTEXTO DE DADOS (JSON):\n" +
          contextData +
          "\n\n### PERGUNTA DO USUÁRIO:\n" +
          userQuestion
      );

      return { answer: result.response.text() };
    } catch (error) {
      console.error("Erro detalhado na função 'askDaqui':", error);
      throw new HttpsError("internal", "Erro ao processar sua pergunta.");
    }
  }
);
