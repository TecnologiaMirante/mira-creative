// /src/context/UserContext.js

import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@infra/firebase";

const UserContext = createContext();

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return true;
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken && !isTokenExpired(storedToken) ? storedToken : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Auto logout se o token expirar
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token]);

  // Login automático ao recarregar (se Firebase estiver autenticado)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (
        firebaseUser &&
        firebaseUser.email &&
        firebaseUser.email.endsWith("@mirante.com.br")
      ) {
        const idToken = await firebaseUser.getIdToken();
        const userRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            display_name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            ...docSnap.data(),
          };
          login({ token: idToken, user: userData });
        }
      } else {
        logout();
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Função de login
  const login = ({ token, user }) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // Função de logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

// Função auxiliar para buscar dados do Firestore
export const getUserData = async () => {
  const uid = auth?.currentUser?.uid;
  if (!uid) return null;

  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export default UserContext;
