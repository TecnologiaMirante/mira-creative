import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./config";

// Criar uma notificação
export const createNotificacao = async (notificacaoData) => {
  try {
    const notificacoesRef = collection(db, "notificacoes");

    // --- LÓGICA DO TTL (7 DIAS) ---
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + 7);
    // ------------------------------

    const docRef = await addDoc(notificacoesRef, {
      ...notificacaoData,
      isRead: false,
      createdAt: serverTimestamp(),
      expireAt: dataExpiracao,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return null;
  }
};

// Listener para notificações de um usuário
export const listenToNotificacoes = (userId, onDataChange) => {
  try {
    const q = query(
      collection(db, "notificacoes"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notificacoes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        onDataChange(notificacoes);
      },
      (error) => {
        console.error("Erro ao escutar notificações:", error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Erro ao criar query de notificações:", error);
    return () => {};
  }
};

// Marcar notificação como lida
export const markNotificacaoAsRead = async (notificacaoId) => {
  try {
    const notificacaoRef = doc(db, "notificacoes", notificacaoId);
    await updateDoc(notificacaoRef, {
      isRead: true,
      readAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    return false;
  }
};

// Marcar todas notificações como lidas
export const markAllNotificacoesAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, "notificacoes"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );

    const querySnapshot = await getDocs(q);
    const batch = [];

    querySnapshot.forEach((docSnapshot) => {
      const notificacaoRef = doc(db, "notificacoes", docSnapshot.id);
      batch.push(
        updateDoc(notificacaoRef, {
          isRead: true,
          readAt: serverTimestamp(),
        })
      );
    });

    await Promise.all(batch);
    return true;
  } catch (error) {
    console.error("Erro ao marcar todas notificações como lidas:", error);
    return false;
  }
};

// Excluir notificação (soft delete)
export const deleteNotificacao = async (notificacaoId) => {
  try {
    const notificacaoRef = doc(db, "notificacoes", notificacaoId);
    await deleteDoc(notificacaoRef);
    return true;
  } catch (error) {
    console.error("Erro ao excluir notificação:", error);
    return false;
  }
};

// Criar notificação para criação de programa
export const notificarCriacaoPrograma = async (
  programa,
  usuariosIds,
  criadoPorNome
) => {
  try {
    const notificacoes = usuariosIds.map((userId) =>
      createNotificacao({
        userId,
        tipo: "programa_criado",
        titulo: "Novo Programa",
        mensagem: `${criadoPorNome} criou "${programa.nome}"`,
        programaId: programa.id,
        link: `/home/programas/${programa.id}`,
      })
    );

    await Promise.all(notificacoes);
    return true;
  } catch (error) {
    console.error("Erro ao notificar criação de programa:", error);
    return false;
  }
};

// Criar notificação para edição de programa
export const notificarEdicaoPrograma = async (
  programa,
  usuariosIds,
  editadoPorNome,
  mudancas
) => {
  try {
    const camposMudados = mudancas.map((m) => m.campo).join(", ");
    const notificacoes = usuariosIds.map((userId) =>
      createNotificacao({
        userId,
        tipo: "programa_editado",
        titulo: "Programa Atualizado",
        mensagem: `${editadoPorNome} alterou "${programa.nome}" (${camposMudados})`,
        programaId: programa.id,
        link: `/home/programas/${programa.id}`,
      })
    );

    await Promise.all(notificacoes);
    return true;
  } catch (error) {
    console.error("Erro ao notificar edição de programa:", error);
    return false;
  }
};

// Criar notificação para criação de pauta
export const notificarCriacaoPauta = async (
  pauta,
  usuariosIds,
  criadoPorNome
) => {
  try {
    const notificacoes = usuariosIds.map((userId) =>
      createNotificacao({
        userId,
        tipo: "pauta_criada",
        titulo: "Nova Pauta Criada",
        mensagem: `${criadoPorNome} criou a pauta "${pauta.titulo}"`,
        pautaId: pauta.id,
        link: `/home/pautas/${pauta.id}`,
      })
    );

    await Promise.all(notificacoes);
    return true;
  } catch (error) {
    console.error("Erro ao notificar criação de pauta:", error);
    return false;
  }
};

// Criar notificação para edição de pauta
export const notificarEdicaoPauta = async (
  pauta,
  usuariosIds,
  editadoPorNome,
  mudancas
) => {
  try {
    const camposMudados = mudancas.map((m) => m.campo).join(", ");
    const notificacoes = usuariosIds.map((userId) =>
      createNotificacao({
        userId,
        tipo: "pauta_editada",
        titulo: "Pauta Atualizada",
        mensagem: `${editadoPorNome} atualizou a pauta "${pauta.titulo}" (${camposMudados})`,
        pautaId: pauta.id,
        link: `/home/pautas/${pauta.id}`,
      })
    );

    await Promise.all(notificacoes);
    return true;
  } catch (error) {
    console.error("Erro ao notificar edição de pauta:", error);
    return false;
  }
};

// Criar notificação para criação de roteiro
export const notificarCriacaoRoteiro = async (
  roteiro,
  pautaTitulo,
  usuariosIds,
  criadoPorNome
) => {
  try {
    const notificacoes = usuariosIds.map((userId) =>
      createNotificacao({
        userId,
        tipo: "roteiro_criado",
        titulo: "Novo Roteiro Criado",
        mensagem: `${criadoPorNome} criou um roteiro para "${pautaTitulo}"`,
        roteiroId: roteiro.id,
        pautaId: roteiro.pautaId,
        link: `/home/pautas/${roteiro.pautaId}`,
      })
    );

    await Promise.all(notificacoes);
    return true;
  } catch (error) {
    console.error("Erro ao notificar criação de roteiro:", error);
    return false;
  }
};

// Criar notificação para edição de roteiro
export const notificarEdicaoRoteiro = async (
  roteiro,
  pautaTitulo,
  usuariosIds,
  editadoPorNome
) => {
  try {
    const notificacoes = usuariosIds.map((userId) =>
      createNotificacao({
        userId,
        tipo: "roteiro_editado",
        titulo: "Roteiro Atualizado",
        mensagem: `${editadoPorNome} atualizou o roteiro de "${pautaTitulo}"`,
        roteiroId: roteiro.id,
        pautaId: roteiro.pautaId,
        link: `/home/pautas/${roteiro.pautaId}`,
      })
    );

    await Promise.all(notificacoes);
    return true;
  } catch (error) {
    console.error("Erro ao notificar edição de roteiro:", error);
    return false;
  }
};
