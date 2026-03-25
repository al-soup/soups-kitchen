"use client";

import { notFound } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  MenuIcon,
  UserIcon,
  LogInIcon,
  SettingsIcon,
  LogOutIcon,
  LinkedInIcon,
  MailIcon,
  InfoIcon,
  LocateIcon,
  GitHubIcon,
  GoIcon,
  NodeJsIcon,
  NuxtJsIcon,
  DockerIcon,
  GitLabCIIcon,
  RedisIcon,
  KubernetesIcon,
  TypeScriptIcon,
  SvelteKitIcon,
  D3JsIcon,
  CouchDBIcon,
  GitHubCIIcon,
  AngularIcon,
  NestJSIcon,
  JavaIcon,
  MongoDBIcon,
  FlutterIcon,
  FirebaseIcon,
  PythonIcon,
  MySQLIcon,
  NativeScriptIcon,
  ReactIcon,
  NextJsIcon,
  DenoIcon,
  PostgreSQLIcon,
  SupabaseIcon,
} from "@/constants/icons";
import type { ComponentType } from "react";
import styles from "./DevIcons.module.css";

if (process.env.NODE_ENV === "production") {
  notFound();
}

const icons: { name: string; Component: ComponentType<{ size?: number }> }[] = [
  { name: "AngularIcon", Component: AngularIcon },
  { name: "CouchDBIcon", Component: CouchDBIcon },
  { name: "D3JsIcon", Component: D3JsIcon },
  { name: "DenoIcon", Component: DenoIcon },
  { name: "DockerIcon", Component: DockerIcon },
  { name: "FirebaseIcon", Component: FirebaseIcon },
  { name: "FlutterIcon", Component: FlutterIcon },
  { name: "GitHubCIIcon", Component: GitHubCIIcon },
  { name: "GitHubIcon", Component: GitHubIcon },
  { name: "GitLabCIIcon", Component: GitLabCIIcon },
  { name: "GoIcon", Component: GoIcon },
  { name: "InfoIcon", Component: InfoIcon },
  { name: "JavaIcon", Component: JavaIcon },
  { name: "KubernetesIcon", Component: KubernetesIcon },
  { name: "LinkedInIcon", Component: LinkedInIcon },
  { name: "LocateIcon", Component: LocateIcon },
  { name: "LogInIcon", Component: LogInIcon },
  { name: "LogOutIcon", Component: LogOutIcon },
  { name: "MailIcon", Component: MailIcon },
  { name: "MenuIcon", Component: MenuIcon },
  { name: "MongoDBIcon", Component: MongoDBIcon },
  { name: "MySQLIcon", Component: MySQLIcon },
  { name: "NativeScriptIcon", Component: NativeScriptIcon },
  { name: "NestJSIcon", Component: NestJSIcon },
  { name: "NextJsIcon", Component: NextJsIcon },
  { name: "NodeJsIcon", Component: NodeJsIcon },
  { name: "NuxtJsIcon", Component: NuxtJsIcon },
  { name: "PostgreSQLIcon", Component: PostgreSQLIcon },
  { name: "PythonIcon", Component: PythonIcon },
  { name: "ReactIcon", Component: ReactIcon },
  { name: "RedisIcon", Component: RedisIcon },
  { name: "SettingsIcon", Component: SettingsIcon },
  { name: "SupabaseIcon", Component: SupabaseIcon },
  { name: "SvelteKitIcon", Component: SvelteKitIcon },
  { name: "TypeScriptIcon", Component: TypeScriptIcon },
  { name: "UserIcon", Component: UserIcon },
];

const sizes = [16, 24, 32];

export default function DevIconsPage() {
  usePageTitle("Icons");

  return (
    <div className={styles.page}>
      <p className={styles.count}>{icons.length} icons</p>
      <div className={styles.grid}>
        {icons.map(({ name, Component }) => (
          <div key={name} className={styles.card}>
            <div className={styles.sizes}>
              {sizes.map((s) => (
                <Component key={s} size={s} />
              ))}
            </div>
            <code className={styles.name}>{name}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
