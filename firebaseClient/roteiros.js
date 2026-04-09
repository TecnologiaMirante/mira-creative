import { db } from "./config";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

// BUSCA UM ÚNICO ROTEIRO PELO ID
export const getRoteiro = async (id) => {
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
export const createRoteiro = async (roteiroData, userId) => {
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
export const updateRoteiro = async (roteiroId, newScriptRows, userId) => {
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
