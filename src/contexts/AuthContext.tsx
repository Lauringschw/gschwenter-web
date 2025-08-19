// src/contexts/AuthContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import Cookies from "js-cookie";
import { LOGIN_MUTATION } from "@/lib/queries";

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginMutation] = useMutation(LOGIN_MUTATION);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = Cookies.get("auth-token");
    const userData = localStorage.getItem("user");

    console.log("Auth check on startup:", {
      hasToken: !!token,
      hasUserData: !!userData,
      token: token?.substring(0, 20) + "...",
      userData: userData,
    });

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log("User restored from localStorage:", parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      console.log("Attempting GraphQL login mutation...");
      console.log(
        "GraphQL endpoint:",
        process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql"
      );

      const { data, errors } = await loginMutation({
        variables: { username, password },
      });

      console.log("GraphQL response:", { data, errors });

      if (errors) {
        console.error("GraphQL errors:", errors);
        return false;
      }

      if (data?.login) {
        const { token, user: loginUser } = data.login;
        console.log("Login successful:", {
          token: token.substring(0, 20) + "...",
          user: loginUser,
        });

        Cookies.set("auth-token", token, { expires: 7 }); // 7 days
        localStorage.setItem("user", JSON.stringify(loginUser));
        setUser(loginUser);
        return true;
      } else {
        console.log("No login data in response");
        return false;
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Check if it's a network error
      if (error.networkError) {
        console.error("Network error details:", {
          message: error.networkError.message,
          statusCode: error.networkError.statusCode,
          result: error.networkError.result,
        });
      }

      // Check if it's a GraphQL error
      if (error.graphQLErrors) {
        console.error("GraphQL errors:", error.graphQLErrors);
      }

      return false;
    }
  };

  const logout = () => {
    console.log("Logging out user");
    Cookies.remove("auth-token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
