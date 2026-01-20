import { db } from "./config";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

// GET de espelho específico
export const getEspelho = async (id) => {
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

export const createEspelho = async (programaId, userId) => {
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
