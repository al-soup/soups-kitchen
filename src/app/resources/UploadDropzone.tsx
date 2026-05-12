"use client";

import { useCallback, useRef, useState } from "react";
import type { Resource } from "@/lib/supabase/types";
import { uploadResource } from "./api";
import styles from "./UploadDropzone.module.css";

interface UploadDropzoneProps {
  onUploaded: (resource: Resource) => void;
}

interface FailedUpload {
  filename: string;
  message: string;
}

export function UploadDropzone({ onUploaded }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [failures, setFailures] = useState<FailedUpload[]>([]);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      setActiveCount((n) => n + list.length);
      const errors: FailedUpload[] = [];
      await Promise.all(
        list.map(async (file) => {
          try {
            const resource = await uploadResource(file);
            onUploaded(resource);
          } catch (err) {
            errors.push({
              filename: file.name,
              message: err instanceof Error ? err.message : "Upload failed",
            });
          } finally {
            setActiveCount((n) => n - 1);
          }
        })
      );
      if (errors.length) setFailures((prev) => [...prev, ...errors]);
    },
    [onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files?.length) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles]
  );

  const handlePick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        uploadFiles(e.target.files);
        e.target.value = "";
      }
    },
    [uploadFiles]
  );

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload files"
      >
        <p className={styles.primary}>
          Drop files here or <span className={styles.linkish}>browse</span>
        </p>
        <p className={styles.hint}>Images, video, documents — up to 50 MB</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className={styles.input}
          onChange={handlePick}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      {activeCount > 0 && (
        <p className={styles.activity}>
          Uploading {activeCount} file{activeCount !== 1 ? "s" : ""}…
        </p>
      )}
      {failures.length > 0 && (
        <ul className={styles.errors}>
          {failures.map((f, i) => (
            <li key={`${f.filename}-${i}`}>
              <strong>{f.filename}</strong>: {f.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
