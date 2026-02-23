"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getSupabase } from "@/lib/supabase/client";
import styles from "./page.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const safeRedirect =
    redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!email || !EMAIL_RE.test(email) || !password) {
      setError("Invalid email or password");
      return;
    }

    setPending(true);
    const { error: authError } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });
    setPending(false);

    if (authError) {
      setError(
        authError.status === 429
          ? "Too many attempts. Please wait."
          : "Invalid email or password"
      );
      return;
    }

    router.push(safeRedirect);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <p className={styles.error}>{error}</p>}

      <label className={styles.label} htmlFor="email">
        Email
      </label>
      <input
        className={styles.input}
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
      />

      <label className={styles.label} htmlFor="password">
        Password
      </label>
      <input
        className={styles.input}
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />

      <button className={styles.button} type="submit" disabled={pending}>
        {pending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  usePageTitle("Login");

  return (
    <div className={styles.container}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
