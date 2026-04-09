import { auth, db } from "./config";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";

// Funcao de login via Google com conta da Mirante
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!user.email.endsWith("@mirante.com.br")) {
      alert("Apenas contas @mirante.com.br sao permitidas!");
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
        typeUser: "Visualizador",
      });
    }

    const userData = await getUserData();
    const token = await user.getIdToken();

    return { user: userData, token };
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return null;
  }
};

// Funcao de logout
export const logout = async (navigate) => {
  try {
    await signOut(auth);
    if (navigate) navigate("/login");
  } catch (error) {
    console.error("Erro ao deslogar:", error);
  }
};

export const getUserData = async () => {
  // Cache para evitar chamadas repetidas
  let cachedUserData = null;

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

export const getUsers = async () => {
  try {
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        uid: doc.id,
        ...doc.data(),
      });
    });
    return users;
  } catch (error) {
    console.error("Erro ao buscar usuarios:", error);
    return [];
  }
};
