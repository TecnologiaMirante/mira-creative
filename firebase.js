import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  deleteUser,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
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
const functions = getFunctions(app, "southamerica-east1"); // Especifique a região se necessário
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

const logout = async (navigate) => {
  try {
    await signOut(auth);
    console.log("Deslogando...");
    if (navigate) navigate("/login");
  } catch (error) {
    console.error("Erro ao deslogar:", error);
  }
};

// --- CONEXÃO COM EMULADORES ---
// Este bloco detecta se estamos em ambiente de desenvolvimento local
// e aponta todos os serviços do Firebase para os emuladores locais.
// if (
//   window.location.hostname === "localhost" ||
//   window.location.hostname.startsWith("192.168.")
// ) {
//   console.log(
//     "🔥 Ambiente de desenvolvimento. Conectando aos Emuladores do Firebase..."
//   );
//   try {
//     connectAuthEmulator(auth, "http://localhost:9099");
//     connectFirestoreEmulator(db, "localhost", 8080);
//     connectFunctionsEmulator(functions, "localhost", 5001);
//     console.log("✅ Emuladores conectados com sucesso!");
//   } catch (error) {
//     console.error("❌ Erro ao conectar aos emuladores:", error);
//   }
// }

export { auth, db, storage, functions, signInWithGoogle, logout, getUserData };
