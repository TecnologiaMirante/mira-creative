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
  where,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

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
const getProgramas = async () => {
  try {
    const q = query(
      collection(db, "programas"),
      where("isVisible", "==", true),
      orderBy("dataExibicao", "desc")
    );
    const querySnapshot = await getDocs(q);
    const programas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return programas;
  } catch (error) {
    console.error("Erro ao buscar programas: ", error);
    return [];
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
const removePautaFromEspelho = async (espelhoId, pautaId) => {
  try {
    const espelhoRef = doc(db, "espelhos", espelhoId);
    await updateDoc(espelhoRef, {
      pautasOrdenadas: arrayRemove(pautaId),
    });
    const pautaRef = doc(db, "pautas", pautaId);
    await updateDoc(pautaRef, {
      espelhoId: null,
    });
    return true;
  } catch (error) {
    console.error("Erro ao remover pauta do espelho: ", error);
    return false;
  }
};

// ADICIONA UMA PAUTA AO ARRAY 'pautasOrdenadas' DO ESPELHO
const addPautaToEspelho = async (espelhoId, pautaId) => {
  try {
    const espelhoRef = doc(db, "espelhos", espelhoId);
    await updateDoc(espelhoRef, {
      pautasOrdenadas: arrayUnion(pautaId),
    });
    // E "setar" o espelhoId na pauta
    const pautaRef = doc(db, "pautas", pautaId);
    await updateDoc(pautaRef, {
      espelhoId: espelhoId,
    });
    return true;
  } catch (error) {
    console.error("Erro ao adicionar pauta ao espelho: ", error);
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

const getAllVisiblePautas = async () => {
  try {
    const q = query(
      collection(db, "pautas"),
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
    console.error("Erro ao buscar todas as pautas: ", error);
    return [];
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
  logout,
  getUserData,
  getProgramas,
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
  getPautas,
  getPauta,
  createPauta,
  getAllVisiblePautas,
  updatePauta,
  deletePauta,
  getRoteiro,
  createRoteiro,
  updateRoteiro,
};
