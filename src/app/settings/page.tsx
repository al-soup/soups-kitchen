"use client";

import { useRouter } from "next/navigation";
import { PageTitle } from "@/components/ui/PageTitle";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { useAuth } from "@/context/AuthContext";
import { getSupabase } from "@/lib/supabase/client";
import { getAvatarUrl } from "@/lib/avatar";
import styles from "./page.module.css";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      await getSupabase().auth.signOut();
    } catch (e) {
      console.error("Logout failed:", e);
    }
    router.push("/login");
  }

  return (
    <div className={styles.page}>
      <PageTitle title="Settings" />
      <h1 className={styles.title}>Settings</h1>

      {user && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <div className={styles.account}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAvatarUrl(user.id, 80)}
              alt="Avatar"
              className={styles.avatar}
            />
            <div className={styles.accountInfo}>
              <span className={styles.email}>{user.email}</span>
              <span className={styles.userId}>{user.id}</span>
            </div>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}

      <div className={styles.section}>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
