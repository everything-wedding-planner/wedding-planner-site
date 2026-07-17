// /// <reference types="vite/client" />

import { useState } from "react";
import { useAuth } from "../AuthProvider";
import { Navigate } from "react-router-dom";

export default function App() {
  const { user, login, logout, isLoading } = useAuth();
  console.log("App user:", user);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
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
