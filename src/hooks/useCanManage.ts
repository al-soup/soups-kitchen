import { useUserRole } from "./useUserRole";

export function useCanManage(targetTable: string) {
  const { role, loading } = useUserRole(targetTable);
  return {
    canManage: role === "manager" || role === "admin",
    loading,
  };
}
