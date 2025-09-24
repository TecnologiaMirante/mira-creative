// functions/index.js

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");

initializeApp();

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

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

    const userQuestion = history.pop().content;

    try {
      const db = getFirestore();
      const pautasSnapshot = await db.collection("pautas").get();
      const pautasData = pautasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const contextData = JSON.stringify(pautasData, null, 2);

      const now = new Date();

      const systemInstruction = `
        Você é 'Daqui', um assistente de IA especialista em analisar dados de roteiros para uma produtora.
        Sua única fonte de conhecimento são os dados em formato JSON fornecidos aqui.
        Responda as perguntas do usuário de forma concisa e amigável, baseando-se SOMENTE nos dados.
        
        IMPORTANTE: Quando você mencionar um roteiro específico, SEMPRE inclua um link para ele no final da sua menção usando o formato [link:home/script/view/ID_DO_ROTEIRO]. O ID está no JSON de cada roteiro.
        
        Exemplo de resposta: "Encontrei o roteiro sobre a Festa Junina. [link:home/script/view/xyz12345]"
        
        Não invente informações. Se a resposta não estiver nos dados, diga que não encontrou a informação.
        Data e hora atuais para referência: ${new Date().toLocaleString(
          "pt-BR"
        )}.
        
        DADOS DOS ROTEIROS DISPONÍVEIS:
        ${contextData}
      `;

      const geminiHistory = history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
        systemInstruction: systemInstruction,
      });

      const chat = model.startChat({
        history: geminiHistory,
      });

      const result = await chat.sendMessage(userQuestion);
      const response = await result.response;
      const text = response.text();

      return { answer: text };
    } catch (error) {
      console.error("Erro detalhado na execução da função 'askDaqui':", error);
      throw new HttpsError(
        "internal",
        "Ocorreu um erro ao processar sua pergunta no servidor."
      );
    }
  }
);
