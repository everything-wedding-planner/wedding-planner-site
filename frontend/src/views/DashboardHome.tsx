import { useAuth } from "../AuthProvider";

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800">
        Welcome back, {user}
      </h1>
      <p className="mt-2 text-stone-500">Let's plan your perfect day</p>
    </div>
  );
}
