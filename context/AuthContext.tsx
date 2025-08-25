import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User, StoredUser } from '../types';
import * as api from '../services/api';

type AuthenticatedUser = Omit<StoredUser, 'password'>;

interface AuthContextType {
  currentUser: AuthenticatedUser | null;
  loading: boolean;
  getUsers: () => Promise<StoredUser[]>;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  addUser: (user: Pick<StoredUser, 'username' | 'password'>) => Promise<{ success: boolean, message: string }>;
  deleteUser: (username: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedInUser = async () => {
        try {
            const user = await api.getCurrentUser();
            setCurrentUser(user);
        } catch (error) {
            console.log("No active session found.");
            setCurrentUser(null)
        } finally {
            setLoading(false);
        }
    };
    checkLoggedInUser();
  }, []);

  const getUsers = useCallback(async () => {
    return api.getUsers();
  }, []);

  const login = useCallback(async (username: string, pass: string) => {
    const user = await api.loginUser(username, pass);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    await api.logoutUser();
    setCurrentUser(null);
  }, []);

  const changePassword = useCallback(async (oldPass: string, newPass: string) => {
    if (!currentUser) return false;
    return api.changePassword(oldPass, newPass);
  }, [currentUser]);

  const addUser = useCallback(async (user: Pick<StoredUser, 'username' | 'password'>): Promise<{ success: boolean, message: string }> => {
    return api.addUser(user);
  }, []);

  const deleteUser = useCallback(async (username: string) => {
    if (username === currentUser?.username) {
        alert('Você não pode excluir a si mesmo.');
        return;
    }
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) {
        await api.deleteUser(username);
    }
  }, [currentUser]);

  const value = { currentUser, loading, getUsers, login, logout, changePassword, addUser, deleteUser };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
