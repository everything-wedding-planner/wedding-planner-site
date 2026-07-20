import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserRow } from "../../src/models/Users/userModel";

interface AuthContextType {
  userId: string | null;
  user: UserRow | null;
  login: (id: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        setUserId(data.id);
        setUser(data.user);
      })
      .catch(() => {
        setUserId(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (userId: string) => {
    setUserId(userId);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUserId(null);
    }
  };

  return (
    <AuthContext.Provider value={{ userId, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
