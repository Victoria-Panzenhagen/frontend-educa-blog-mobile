
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import {
  login as loginService,
  logout as logoutService,
  getStoredToken,
  getStoredUser,
  saveStoredUser,
} from '@/services/auth.service';

import { AuthUser, LoginCredentials } from '@/types/auth';

interface AuthContextData {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Pick<AuthUser, 'name' | 'email'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData,
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredSession() {
      try {
        const [token, storedUser] = await Promise.all([
          getStoredToken(),
          getStoredUser(),
        ]);

        if (token && storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Erro ao recuperar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredSession();
  }, []);

  const signIn = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await loginService(credentials);
      setUser(response.user);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await logoutService();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (profile: Pick<AuthUser, 'name' | 'email'>) => {
      if (!user) return;
      const updatedUser = { ...user, ...profile };
      await saveStoredUser(updatedUser);
      setUser(updatedUser);
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
