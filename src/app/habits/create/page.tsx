"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { PageTitle } from "@/components/ui/PageTitle";

import styles from "../../shared-page.module.css";

export default function CreateHabitPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole("habit");

  const loading = authLoading || roleLoading;
  const canCreate = role === "admin" || role === "manager";

  useEffect(() => {
    if (loading) return;
    if (!user)
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  if (!canCreate) {
    return (
      <div className={styles.page}>
        <PageTitle title="Create Habit" />
        <h1 className={styles.title}>Not Authorized</h1>
        <p className={styles.description}>
          You don&apos;t have permission to create habits.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageTitle title="Create Habit" />
      <h1 className={styles.title}>Create Habit</h1>
      <p className={styles.description}>Habit creation coming soon.</p>
    </div>
  );
}
