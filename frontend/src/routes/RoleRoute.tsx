import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types";

export function RoleRoute({ allowedRole }: { allowedRole: UserRole }) {
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  if (!isInitialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allowedRole) {
    const dashboard =
      user.role === "admin" ? "/admin/dashboard" : "/author/dashboard";
    return <Navigate to="/unauthorized" replace state={{ fallback: dashboard }} />;
  }
  return <Outlet />;
}
