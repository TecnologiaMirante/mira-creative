// /src/context/UserCacheContext.jsx

import { createContext, useState, useEffect, useContext } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseClient";

const UserCacheContext = createContext();

export const UserCacheProvider = ({ children }) => {
  const [userCache, setUserCache] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const usersCollectionRef = collection(db, "users");
        const querySnapshot = await getDocs(usersCollectionRef);

        const cache = new Map();
        querySnapshot.forEach((doc) => {
          // Salva o objeto de usuário inteiro, incluindo o UID
          cache.set(doc.id, { uid: doc.id, ...doc.data() });
        });

        setUserCache(cache);
      } catch (error) {
        console.error("Erro ao carregar cache de usuários:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  const getUserById = (uid) => {
    if (!uid) return { display_name: "N/D" };
    return (
      userCache.get(uid) || { display_name: `ID (${uid.substring(0, 4)}...)` }
    );
  };

  return (
    <UserCacheContext.Provider
      value={{
        getUserById,
        isLoadingCache: isLoading,
        userCache,
      }}
    >
      {children}
    </UserCacheContext.Provider>
  );
};

export const useUserCache = () => {
  return useContext(UserCacheContext);
};
