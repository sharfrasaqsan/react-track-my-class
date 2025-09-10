import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/Config";
import { doc, getDoc } from "firebase/firestore";
import Loader from "../utils/Loader";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const res = await getDoc(doc(db, "users", currentUser.uid));
          if (res.exists()) {
            setUser({ id: currentUser.uid, ...res.data() });
          } else {
            setUser(null);
          }
        } catch (err) {
          console.log("Error Code: ", err.code, "Error Message: ", err.message);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
