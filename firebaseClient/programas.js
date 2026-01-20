import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "./config";

// GET de todos os programas
export const getProgramas = (onDataChange) => {
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
export const getPrograma = async (id) => {
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
export const createPrograma = async (programaData) => {
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

export const updatePrograma = async (programaId, programaData) => {
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

export const deletePrograma = async (programaId) => {
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

// Função para forçar a atualização da duração do programa
export const updateProgramaDuracao = async (programaId, totalSegundos) => {
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
