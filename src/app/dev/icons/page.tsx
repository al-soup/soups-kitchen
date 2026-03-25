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
} from "@/constants/icons";
import type { ComponentType } from "react";
import styles from "./DevIcons.module.css";

if (process.env.NODE_ENV === "production") {
  notFound();
}

const icons: { name: string; Component: ComponentType<{ size?: number }> }[] = [
  { name: "MenuIcon", Component: MenuIcon },
  { name: "UserIcon", Component: UserIcon },
  { name: "LogInIcon", Component: LogInIcon },
  { name: "SettingsIcon", Component: SettingsIcon },
  { name: "LogOutIcon", Component: LogOutIcon },
  { name: "LinkedInIcon", Component: LinkedInIcon },
  { name: "MailIcon", Component: MailIcon },
  { name: "InfoIcon", Component: InfoIcon },
  { name: "LocateIcon", Component: LocateIcon },
  { name: "GitHubIcon", Component: GitHubIcon },
  { name: "GoIcon", Component: GoIcon },
  { name: "NodeJsIcon", Component: NodeJsIcon },
  { name: "NuxtJsIcon", Component: NuxtJsIcon },
  { name: "DockerIcon", Component: DockerIcon },
  { name: "GitLabCIIcon", Component: GitLabCIIcon },
  { name: "RedisIcon", Component: RedisIcon },
  { name: "KubernetesIcon", Component: KubernetesIcon },
  { name: "TypeScriptIcon", Component: TypeScriptIcon },
  { name: "SvelteKitIcon", Component: SvelteKitIcon },
  { name: "D3JsIcon", Component: D3JsIcon },
  { name: "CouchDBIcon", Component: CouchDBIcon },
  { name: "GitHubCIIcon", Component: GitHubCIIcon },
  { name: "AngularIcon", Component: AngularIcon },
  { name: "NestJSIcon", Component: NestJSIcon },
  { name: "JavaIcon", Component: JavaIcon },
  { name: "MongoDBIcon", Component: MongoDBIcon },
  { name: "FlutterIcon", Component: FlutterIcon },
  { name: "FirebaseIcon", Component: FirebaseIcon },
  { name: "PythonIcon", Component: PythonIcon },
  { name: "MySQLIcon", Component: MySQLIcon },
  { name: "NativeScriptIcon", Component: NativeScriptIcon },
  { name: "ReactIcon", Component: ReactIcon },
  { name: "NextJsIcon", Component: NextJsIcon },
  { name: "DenoIcon", Component: DenoIcon },
  { name: "PostgreSQLIcon", Component: PostgreSQLIcon },
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
