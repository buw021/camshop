// contexts/AuthContext.tsx
import React, {
  createContext,
  
  useState,
  ReactNode,
  useEffect,
} from "react";
import UserService from "../services/UserService";

interface AuthContextType {
  token: string | null;
  loading: boolean;
  setToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const data = await UserService.getUserSession();
        setToken(data.token);
      } catch (error) {
        console.error("Error fetching session:", error);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  return (
    <AuthContext.Provider value={{ token, loading, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
