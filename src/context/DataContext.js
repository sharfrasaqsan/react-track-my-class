import { collection, getDocs } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/Config";
import { toast } from "sonner";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getDocs(collection(db, "users"));
        const resData = res.docs?.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(resData);
      } catch (err) {
        console.log("Error fetching users : ", err.code, err.message);
        toast.error("Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <DataContext.Provider value={{ users, setUsers, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  return useContext(DataContext);
};
