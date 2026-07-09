// /// <reference types="vite/client" />

import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";

export default function App() {
  const { user, login, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-8 shadow-xl text-center max-w-sm">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Welcome, Guest!
          </h1>
          <button
            onClick={() => navigate("/auth")}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="rounded-2xl bg-white p-8 shadow-xl text-center max-w-sm">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          React + Tailwind!
        </h1>
        <p className="text-slate-600 mb-4">
          Utility classes make interface styling fast and maintainable.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition">
          Get Started
        </button>
      </div>
    </div>
  );
}
