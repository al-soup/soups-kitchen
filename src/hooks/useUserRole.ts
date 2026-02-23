import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Database } from "@/lib/supabase/database.types";

type UserRole = Database["public"]["Enums"]["user_role"] | null;

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}

function extractRole(token: string, targetTable: string): UserRole {
  try {
    const payload = decodeJwtPayload(token);
    const roles = payload.user_roles as Record<string, string> | undefined;
    if (!roles) return null;
    if (roles._global === "admin") return "admin";
    return (roles[targetTable] as UserRole) ?? null;
  } catch {
    return null;
  }
}

export function useUserRole(targetTable: string) {
  const { accessToken, loading } = useAuth();

  const role = useMemo(
    () => (accessToken ? extractRole(accessToken, targetTable) : null),
    [accessToken, targetTable]
  );

  return { role, loading };
}
