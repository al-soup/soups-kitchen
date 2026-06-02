"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { KnowledgeForm } from "../_form/KnowledgeForm";
import { createKnowledge, type KnowledgeFormInput } from "../_form/api";
import sharedStyles from "../../../shared-page.module.css";
import styles from "./page.module.css";

export default function CreateKnowledgePage() {
  usePageTitle("New Entry", "Knowledge Base");

  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [authLoading, user, router, pathname]);

  const handleSubmit = useCallback(
    async (input: KnowledgeFormInput) => {
      const entry = await createKnowledge(input);
      router.push(`/apps/knowledge-base/${entry.id}`);
    },
    [router]
  );

  if (authLoading || !user) {
    return (
      <div className={sharedStyles.page}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={sharedStyles.page}>
      <div className={styles.header}>
        <Link
          href="/apps/knowledge-base"
          className={styles.backLink}
          aria-label="Back to Knowledge Base"
        >
          ←
        </Link>
        <h1 className={sharedStyles.title}>New Entry</h1>
      </div>
      <KnowledgeForm
        submitLabel="Create entry"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/apps/knowledge-base")}
      />
    </div>
  );
}
