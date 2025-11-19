// /firebase.js (pasta raiz do projeto)

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  deleteUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
  arrayRemove,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { toast } from "sonner";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, "southamerica-east1");
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// Cache para evitar chamadas repetidas
let cachedUserData = null;

const getUserData = async () => {
  if (cachedUserData) return cachedUserData;

  const user = auth.currentUser;
  if (!user) return null;

  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    cachedUserData = {
      uid: user.uid,
      email: user.email,
      photoURL: user.photoURL,
      display_name: user.displayName,
      ...docSnap.data(),
    };
    return cachedUserData;
  }

  return null;
};

// Função de Login via Google com conta da Mirante
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!user.email.endsWith("@mirante.com.br")) {
      alert("Apenas contas @mirante.com.br são permitidas!");

      await deleteUser(user).catch((err) =>
        console.error("Erro ao excluir usuário:", err)
      );
      await signOut(auth);
      return null;
    }

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      const now = new Date();
      const localDate = new Date(now.getTime() - 3 * 60 * 60 * 1000); // UTC-3
      const formattedDate = localDate.toUTCString();

      await setDoc(userRef, {
        uid: user.uid,
        display_name: user.displayName,
        photoURL: user.photoURL,
        email: user.email,
        creationTime: formattedDate,
        typeUser: "user",
      });

      console.log("Usuário criado na Firestore");
    } else {
      console.log("Usuário já existe na Firestore");
    }

    const userData = await getUserData();
    const token = await user.getIdToken();

    return { user: userData, token };
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return null;
  }
};

// GET de todos os programas
const listenToProgramas = (onDataChange) => {
  try {
    let q = query(
      collection(db, "programas"),
      where("isVisible", "==", true), // Apenas programas ativos
      orderBy("dataExibicao", "desc") // Os mais novos primeiro
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const programas = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        onDataChange(programas);
      },
      (error) => {
        console.error("Erro ao escutar programas: ", error);
        toast.error("Erro ao carregar programas.");
      }
    );

    return unsubscribe; // Retorna a função para "desligar" o ouvinte
  } catch (error) {
    console.error("Erro ao criar query de programas: ", error);
    return () => {};
  }
};

// GET de programa específico
const getPrograma = async (id) => {
  try {
    const docRef = doc(db, "programas", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.error("Nenhum programa encontrado com o ID:", id);
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar programa: ", error);
    return null;
  }
};

// POST de novo programa
const createPrograma = async (programaData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const newProgramaRef = await addDoc(collection(db, "programas"), {
      ...programaData,
      createdBy: user.uid,
      editedBy: user.uid,
      createdAt: serverTimestamp(),
      editedAt: serverTimestamp(),
    });
    return newProgramaRef.id; // Retorna o ID do novo programa
  } catch (error) {
    console.error("Erro ao criar programa: ", error);
    return null;
  }
};

const updatePrograma = async (programaId, programaData) => {
  try {
    const user = auth.currentUser; // Pega o usuário logado
    if (!user) throw new Error("Usuário não autenticado");

    const programaRef = doc(db, "programas", programaId);
    await updateDoc(programaRef, {
      ...programaData, // nome, status, dataExibicao
      editedBy: user.uid,
      // 'lastEditedByName' também deve ser atualizado aqui
      editedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar programa: ", error);
    return false;
  }
};

const deletePrograma = async (programaId) => {
  try {
    const programaRef = doc(db, "programas", programaId);
    await updateDoc(programaRef, {
      isVisible: false,
    });
    return true;
  } catch (error) {
    console.error("Erro ao deletar programa: ", error);
    return false;
  }
};

// GET de espelho específico
const getEspelho = async (id) => {
  try {
    const docRef = doc(db, "espelhos", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.error("Nenhum espelho encontrado com o ID:", id);
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar espelho: ", error);
    return null;
  }
};

const createEspelho = async (programaId, userId) => {
  try {
    // 1. Cria o novo documento de espelho
    const espelhoData = {
      programaId: programaId,
      pautasOrdenadas: [],
      createdBy: userId,
      editedBy: userId,
      createdAt: serverTimestamp(),
      editedAt: serverTimestamp(),
    };
    const espelhoRef = await addDoc(collection(db, "espelhos"), espelhoData);

    if (!espelhoRef.id) {
      throw new Error("Falha ao criar o documento do espelho.");
    }

    // 2. Atualiza o programa com o ID do novo espelho
    const programaRef = doc(db, "programas", programaId);
    await updateDoc(programaRef, {
      espelhoId: espelhoRef.id,
    });

    // 3. Retorna o novo espelho para a UI
    return { id: espelhoRef.id, ...espelhoData };
  } catch (error) {
    console.error("Erro ao criar espelho e vincular programa:", error);
    return null;
  }
};

// GET de uma lista de pautas por IDs
const getPautasByIds = async (ids) => {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    // O Firestore só permite buscar 10 IDs por vez no 'where in'
    // Por enquanto, vamos assumir menos de 10 para simplificar.
    // Se seu espelho tiver mais de 10 pautas, teremos que "quebrar" em lotes.
    const pautasRef = collection(db, "pautas");
    const q = query(pautasRef, where("__name__", "in", ids));

    const querySnapshot = await getDocs(q);
    const pautas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return pautas;
  } catch (error) {
    console.error("Erro ao buscar pautas por IDs: ", error);
    return [];
  }
};

// PUT de ordem das pautas em um espelho
const updateEspelhoPautas = async (espelhoId, novoArrayDePautas) => {
  try {
    const espelhoRef = doc(db, "espelhos", espelhoId);
    await updateDoc(espelhoRef, {
      pautasOrdenadas: novoArrayDePautas,
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar ordem do espelho: ", error);
    return false;
  }
};

// REMOVE UMA PAUTA DO ARRAY 'pautasOrdenadas' DO ESPELHO
const removePautaFromEspelho = async (espelhoId, pauta, programaId) => {
  try {
    const espelhoRef = doc(db, "espelhos", espelhoId);
    const pautaRef = doc(db, "pautas", pauta.id);
    const programaRef = doc(db, "programas", programaId);

    // Calcula a duração em segundos da pauta que está sendo removida
    const minutos = parseInt(pauta.duracaoMinutos, 10) || 0;
    const segundos = parseInt(pauta.duracaoSegundos, 10) || 0;
    const duracaoEmSegundos = minutos * 60 + segundos;

    await Promise.all([
      updateDoc(espelhoRef, {
        pautasOrdenadas: arrayRemove(pauta.id),
      }),
      updateDoc(pautaRef, {
        espelhoId: null,
        programaId: null,
      }),
      updateDoc(programaRef, {
        pautaCount: increment(-1),
        duracaoTotalSegundos: increment(-duracaoEmSegundos), // <-- ATUALIZA A DURAÇÃO
      }),
    ]);
    return true;
  } catch (error) {
    console.error("Erro ao remover pauta do espelho: ", error);
    return false;
  }
};

// ADICIONA UMA PAUTA AO ARRAY 'pautasOrdenadas' DO ESPELHO
const addPautaToEspelho = async (espelhoId, pauta, programaId) => {
  try {
    const espelhoRef = doc(db, "espelhos", espelhoId);
    const pautaRef = doc(db, "pautas", pauta.id);
    const programaRef = doc(db, "programas", programaId);

    // Calcula a duração em segundos da pauta que está sendo adicionada
    const minutos = parseInt(pauta.duracaoMinutos, 10) || 0;
    const segundos = parseInt(pauta.duracaoSegundos, 10) || 0;
    const duracaoEmSegundos = minutos * 60 + segundos;

    await Promise.all([
      updateDoc(espelhoRef, {
        pautasOrdenadas: arrayUnion(pauta.id),
      }),
      updateDoc(pautaRef, {
        espelhoId: espelhoId,
        programaId: programaId,
      }),
      updateDoc(programaRef, {
        pautaCount: increment(1),
        duracaoTotalSegundos: increment(duracaoEmSegundos), // <-- ATUALIZA A DURAÇÃO
      }),
    ]);
    return true;
  } catch (error) {
    console.error("Erro ao adicionar pauta ao espelho: ", error);
    return false;
  }
};

// Função para forçar a atualização da duração do programa
const updateProgramaDuracao = async (programaId, totalSegundos) => {
  try {
    const programaRef = doc(db, "programas", programaId);
    await updateDoc(programaRef, {
      duracaoTotalSegundos: totalSegundos,
    });
    return true;
  } catch (error) {
    console.error("Erro ao sincronizar duração: ", error);
    return false;
  }
};

// BUSCA TODAS AS PAUTAS VISÍVEIS
const getPautas = async () => {
  try {
    const q = query(
      collection(db, "pautas"),
      where("espelhoId", "==", null),
      where("isVisible", "==", true),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const pautas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return pautas;
  } catch (error) {
    console.error("Erro ao buscar pautas soltas: ", error);
    return [];
  }
};

// BUSCA UMA ÚNICA PAUTA POR ID
const getPauta = async (id) => {
  try {
    const docRef = doc(db, "pautas", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.error("Nenhuma pauta encontrada com o ID:", id);
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar pauta: ", error);
    return null;
  }
};

// GET de todos as pautas
const listenToPautas = (onDataChange) => {
  try {
    const q = query(
      collection(db, "pautas"),
      where("isVisible", "==", true), // Apenas pautas ativas
      orderBy("createdAt", "desc") // As mais novas primeiro
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const pautas = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        onDataChange(pautas);
      },
      (error) => {
        console.error("Erro ao escutar pautas: ", error);
        toast.error("Erro ao carregar pautas.");
      }
    );

    return unsubscribe; // Retorna a função para "desligar" o ouvinte
  } catch (error) {
    console.error("Erro ao criar query de pautas: ", error);
    return () => {};
  }
};

// CRIA UMA NOVA PAUTA
const createPauta = async (pautaData, userId) => {
  try {
    const docRef = await addDoc(collection(db, "pautas"), {
      ...pautaData, // Contém título, produtorId, roteiroId, etc.
      createdBy: userId,
      editedBy: userId,
      createdAt: serverTimestamp(),
      editedAt: serverTimestamp(),
      isVisible: true,
      espelhoId: null,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar pauta: ", error);
    return null;
  }
};

// ATUALIZA PAUTA EXISTENTE
const updatePauta = async (pautaId, pautaData, userId) => {
  try {
    const pautaRef = doc(db, "pautas", pautaId);
    await updateDoc(pautaRef, {
      ...pautaData,
      editedBy: userId,
      editedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar pauta: ", error);
    return false;
  }
};

const deletePauta = async (pautaId) => {
  try {
    console.log("Deletando pauta com ID:", pautaId);
    const pautaRef = doc(db, "pautas", pautaId);
    await updateDoc(pautaRef, {
      isVisible: false,
    });
    return true;
  } catch (error) {
    console.error("Erro ao deletar pauta: ", error);
    return false;
  }
};

// BUSCA UM ÚNICO ROTEIRO PELO ID
const getRoteiro = async (id) => {
  try {
    const docRef = doc(db, "roteiros", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.error("Nenhum roteiro encontrado com o ID:", id);
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar roteiro: ", error);
    return null;
  }
};

// CRIA UM NOVO ROTEIRO
const createRoteiro = async (roteiroData, userId) => {
  try {
    const docRef = await addDoc(collection(db, "roteiros"), {
      ...roteiroData, // Deve conter 'scriptRows'
      createdBy: userId,
      editedBy: userId,
      createdAt: serverTimestamp(),
      editedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar roteiro: ", error);
    return null;
  }
};

// ATUALIZA AS LINHAS DE UM ROTEIRO (scriptRows)
const updateRoteiro = async (roteiroId, newScriptRows, userId) => {
  try {
    const roteiroRef = doc(db, "roteiros", roteiroId);
    await updateDoc(roteiroRef, {
      scriptRows: newScriptRows,
      editedBy: userId,
      editedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Erro ao salvar roteiro: ", error);
    return false;
  }
};

/**
 * ENVIO DE E-MAIL DE CRIAÇÃO
 */
const enviarNotificacaoCriacao = async (
  destinatarioEmail,
  tituloPauta,
  pautaId,
  papel
) => {
  try {
    const WEBHOOK_URL = "https://eohs4z2pchccj0t.m.pipedream.net";
    const remetenteNome =
      auth.currentUser?.displayName || "Sistema Mira Creative";

    const baseUrl =
      import.meta.env.VITE_PUBLIC_APP_URL || "http://192.168.7.40:5173";

    const linkDaPauta = `${baseUrl}/home/pautas/${pautaId}`;

    const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
      <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

        <div style="background-color: #2563eb; padding: 28px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Nova Pauta Criada</h1>
          <p style="color: #dbeafe; margin: 6px 0 0; font-size: 14px;">
            Um novo item foi adicionado ao sistema Mira Creative
          </p>
        </div>

        <div style="padding: 40px 32px; color: #1f2937;">

          <p style="font-size: 16px; line-height: 1.6;">
            Olá! <strong style="color: #2563eb;">${remetenteNome}</strong> criou uma nova pauta:
          </p>

          <h2 style="font-size: 22px; margin: 12px 0 26px; color: #111827;">
            ${tituloPauta}
          </h2>

          <div style="
            background-color: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 30px;
          ">
            <p style="margin: 0 0 10px; font-size: 15px; font-weight: bold; color: #1e3a8a;">
              Informações:
            </p>
            <ul style="list-style: none; padding: 0; margin: 0; margin-top: 12px;">
              <li style="
                margin-bottom: 10px;
                background: #ffffff;
                padding: 12px 15px;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
                font-size: 15px;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 10px;
              ">
                <span style="font-size: 10px; color: #2563eb;">●</span>
                Você foi vinculado como <strong style="color: #2563eb;"> ${papel}</strong>.
              </li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${linkDaPauta}"
              style="
                background-color: #2563eb;
                color: #ffffff;
                padding: 14px 28px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                font-size: 16px;
                display: inline-block;
              ">
              Ver Pauta
            </a>
          </div>

        </div>

        <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
          © ${new Date().getFullYear()} Mira Creative — Sistema automático de notificações.
        </div>

      </div>
    </div>
`;

    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: destinatarioEmail,
        subject: `🎬 Nova Pauta Criada: ${tituloPauta}`,
        body: emailHtml,
      }),
    });
  } catch (error) {
    console.error("Erro ao enviar notificação (webhook):", error);
  }
};

const enviarNotificacaoEdicao = async (
  destinatarios,
  tituloPauta,
  pautaId,
  mudancas
) => {
  try {
    // Filtra emails vazios ou inválidos
    const emailsValidos = destinatarios.filter(
      (email) => email && email.includes("@")
    );
    if (emailsValidos.length === 0) return;

    const WEBHOOK_URL = "https://eohs4z2pchccj0t.m.pipedream.net";
    const remetenteNome =
      auth.currentUser?.displayName || "Sistema Mira Creative";

    const baseUrl =
      import.meta.env.VITE_PUBLIC_APP_URL || "http://192.168.7.40:5173";
    const linkDaPauta = `${baseUrl}/home/pautas/${pautaId}`;

    // NOMES BONITOS
    const camposBonitos = {
      titulo: "Título",
      status: "Status",
      produtorId: "Produtor",
      apresentadorId: "Apresentador",
      roteiristaId: "Roteirista",
      cidade: "Cidade",
      bairro: "Bairro",
      duracaoMinutos: "Duração (Minutos)",
      duracaoSegundos: "Duração (Segundos)",
      motivoCancelamento: "Motivo de Cancelamento",
      dataCancelamento: "Data de Cancelamento",
      dataGravacaoInicio: "Início da Gravação",
      dataGravacaoFim: "Fim da Gravação",
      dataExibicao: "Data de Exibição",
    };

    // COR ESPECIAL PARA STATUS (DEPOIS)
    function corStatus(status) {
      if (!status) return "#065f46"; // padrão verde escuro

      const s = status.toLowerCase();

      if (s === "cancelado" || s === "cancelada") return "#b91c1c"; // vermelho
      if (s === "aprovado" || s === "aprovada") return "#15803d"; // verde
      if (s === "pendente") return "#b45309"; // amarelo

      return "#065f46"; // fallback verde
    }

    // MONTA LISTA DE ALTERAÇÕES COM ANTES → DEPOIS
    const detalhesMudancas = mudancas.map((item) => {
      const campoBonito = camposBonitos[item.campo] || item.campo;

      const corDepois =
        item.campo === "status" ? corStatus(item.depois) : "#065f46";

      return {
        campo: campoBonito,
        antes: item.antes,
        depois: item.depois,
        corDepois,
      };
    });

    // HTML DO EMAIL
    const emailHtml = `
  <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
    <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background-color: #2563eb; padding: 28px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Pauta Atualizada</h1>
        <p style="color: #dbeafe; margin: 6px 0 0; font-size: 14px;">
          Uma pauta recebeu alterações no sistema Mira Creative
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 40px 32px; color: #1f2937;">

        <p style="font-size: 16px; line-height: 1.6;">
          Olá! <strong style="color: #2563eb;">${remetenteNome}</strong> realizou alterações na pauta:
        </p>

        <h2 style="font-size: 22px; margin: 10px 0 26px; color: #111827;">
          ${tituloPauta}
        </h2>

        <div style="
          background-color: #f8fafc;
          border-left: 4px solid #2563eb;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 30px;
        ">
          <p style="margin: 0 0 12px; font-size: 15px; font-weight: bold; color: #1e3a8a;">
            Alterações realizadas:
          </p>

          <div style="margin-top: 12px;">
            ${detalhesMudancas
              .map(
                (item) => `
                <div style="
                  background: #ffffff;
                  border: 1px solid #e5e7eb;
                  border-radius: 6px;
                  padding: 14px 16px;
                  margin-bottom: 12px;
                  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                ">

                  <div style="
                    font-weight: bold;
                    color: #1e3a8a;
                    margin-bottom: 6px;
                    font-size: 15px;
                  ">
                    ${item.campo}
                  </div>

                  <div style="font-size: 14px; color: #6b7280; margin-bottom: 6px;">
                    <span style="font-weight: bold; color: #b91c1c;">Antes:</span><br>
                    ${item.antes}
                  </div>

                  <div style="font-size: 14px; color: ${item.corDepois}; margin-top: 6px;">
                    <span style="font-weight: bold;">Depois:</span><br>
                    ${item.depois}
                  </div>

                </div>
              `
              )
              .join("")}
          </div>
        </div>

        <!-- Button -->
        <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
          <a href="${linkDaPauta}"
            style="
              background-color: #2563eb;
              color: #ffffff;
              padding: 14px 28px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              font-size: 16px;
              display: inline-block;
            ">
            Ver Pauta Atualizada
          </a>
        </div>

        <!-- Fallback Link -->
        <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 20px;">
          Caso o botão não funcione, copie e cole este link no navegador:<br>
          <a href="${linkDaPauta}" style="color: #2563eb;">${linkDaPauta}</a>
        </p>

      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
        © ${new Date().getFullYear()} Mira Creative — Sistema automático de notificações.
      </div>

    </div>
  </div>
`;

    // ENVIA UM EMAIL POR DESTINATÁRIO
    await Promise.all(
      emailsValidos.map((email) =>
        fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: `✏️ Pauta Atualizada: ${tituloPauta}`,
            body: emailHtml,
          }),
        })
      )
    );
  } catch (error) {
    console.error("Erro ao enviar notificação de edição:", error);
  }
};

// Função de Logout
const logout = async (navigate) => {
  try {
    await signOut(auth);
    console.log("Deslogando...");
    if (navigate) navigate("/login");
  } catch (error) {
    console.error("Erro ao deslogar:", error);
  }
};

export {
  auth,
  db,
  storage,
  functions,
  signInWithGoogle,
  getUserData,
  listenToProgramas,
  getPrograma,
  createPrograma,
  updatePrograma,
  getEspelho,
  createEspelho,
  deletePrograma,
  getPautasByIds,
  updateEspelhoPautas,
  removePautaFromEspelho,
  addPautaToEspelho,
  updateProgramaDuracao,
  getPautas,
  getPauta,
  createPauta,
  listenToPautas,
  updatePauta,
  deletePauta,
  getRoteiro,
  createRoteiro,
  updateRoteiro,
  enviarNotificacaoEdicao,
  enviarNotificacaoCriacao,
  logout,
};
