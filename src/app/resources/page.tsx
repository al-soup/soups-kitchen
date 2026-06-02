"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCanManage } from "@/hooks/useCanManage";
import type { Resource } from "@/lib/supabase/types";
import { listResources, renameResource, deleteResource } from "./api";
import { UploadDropzone } from "./UploadDropzone";
import { ResourceGrid } from "./ResourceGrid";
import sharedStyles from "../shared-page.module.css";
import styles from "./page.module.css";

export default function ResourcesPage() {
  usePageTitle("Resources");

  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { canManage } = useCanManage("resources");

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [authLoading, user, router, pathname]);

  useEffect(() => {
    if (authLoading || !user) return;
    const controller = new AbortController();
    listResources()
      .then((data) => {
        if (controller.signal.aborted) return;
        setResources(data);
        setLoadError(null);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setLoadError(err.message);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
      });
    return () => controller.abort();
  }, [authLoading, user]);

  const handleUploaded = useCallback((resource: Resource) => {
    setResources((prev) => [resource, ...prev]);
  }, []);

  const handleRename = useCallback(async (id: string, label: string) => {
    const updated = await renameResource(id, label);
    setResources((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);

  const handleDelete = useCallback(async (resource: Resource) => {
    await deleteResource(resource);
    setResources((prev) => prev.filter((r) => r.id !== resource.id));
  }, []);

  if (authLoading || !user) {
    return (
      <div className={sharedStyles.page}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={sharedStyles.page}>
      <h1 className={sharedStyles.title}>Resources</h1>
      <p className={styles.intro}>
        Files can be referenced in other apps with{" "}
        <code className={styles.code}>{"{{resource:<id>}}"}</code> tokens.
      </p>

      {canManage && <UploadDropzone onUploaded={handleUploaded} />}

      {loading && (
        <p className={sharedStyles.description}>Loading resources...</p>
      )}
      {loadError && <p className={styles.error}>{loadError}</p>}
      {!loading && !loadError && (
        <ResourceGrid
          resources={resources}
          onRename={canManage ? handleRename : undefined}
          onDelete={canManage ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
