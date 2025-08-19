"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailedError, setDetailedError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDetailedError("");

    console.log("Attempting login with:", { username, password: "***" });

    try {
      const success = await login(username, password);

      if (!success) {
        setError("Invalid credentials");
        console.log("Login failed: Invalid credentials returned");
      } else {
        console.log("Login successful");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Login failed");
      setDetailedError(err.message || "Unknown error occurred");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Art Collection Manager
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your collection
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-red-600 text-sm text-center font-medium">
                {error}
              </div>
              {detailedError && (
                <div className="text-red-500 text-xs text-center mt-1">
                  {detailedError}
                </div>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs text-gray-600">
              <div className="font-medium mb-1">Debug Info:</div>
              <div>
                GraphQL URL:{" "}
                {process.env.NEXT_PUBLIC_GRAPHQL_URL ||
                  "http://localhost:4000/graphql"}
              </div>
              <div>Username: {username}</div>
              <div>Password: {"*".repeat(password.length)}</div>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            <div>Default credentials:</div>
            <div className="font-mono">Username: admin</div>
            <div className="font-mono">Password: admin123</div>
          </div>
        </form>
      </div>
    </div>
  );
}
