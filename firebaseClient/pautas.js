import { db } from "./config";

import {
  collection,
  where,
  getDocs,
  query,
  updateDoc,
  doc,
  arrayRemove,
  increment,
  orderBy,
  getDoc,
  addDoc,
  arrayUnion,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

// BUSCA UMA ÚNICA PAUTA POR ID
export const getPauta = async (id) => {
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

// BUSCA TODAS AS PAUTAS VISÍVEIS
export const getPautas = (onChange) => {
  try {
    const q = query(
      collection(db, "pautas"),
      where("isVisible", "==", true),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const pautas = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (onChange) onChange(pautas);
      },
      (error) => {
        console.error("Erro ao escutar pautas:", error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Erro ao buscar pautas soltas: ", error);
    return () => {};
  }
};

// GET de uma lista de pautas por IDs
export const getPautasByIds = async (ids) => {
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

// CRIA UMA NOVA PAUTA
export const createPauta = async (pautaData, userId) => {
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
export const updatePauta = async (pautaId, pautaData, userId) => {
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

export const deletePauta = async (pautaId) => {
  try {
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

// PUT de ordem das pautas em um espelho
export const updateEspelhoPautas = async (espelhoId, novoArrayDePautas) => {
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
export const removePautaFromEspelho = async (espelhoId, pauta, programaId) => {
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
export const addPautaToEspelho = async (espelhoId, pauta, programaId) => {
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
