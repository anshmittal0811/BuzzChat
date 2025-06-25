// auth-context.js
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { jwtDecode } from "jwt-decode";
import { IUser } from "@/types";
import { userService } from "@/services/userService";

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  updateUser: (user: IUser | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  updateUser: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserDetails = async (userId: string) => {
    try {
      const userDetails = await userService.fetchUserDetails(userId);
      setUser(userDetails.data);
    } catch (error) {
      console.error("Failed to fetch user details", error);
      // If fetching user details fails, remove the invalid token
      localStorage.removeItem("accessToken");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        fetchUserDetails(decoded.sub);
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem("accessToken");
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const updateUser = (user: IUser | null) => {
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);
