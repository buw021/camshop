// contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

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
