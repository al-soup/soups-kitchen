"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rehypeHighlightCurated } from "./highlight";
import styles from "./MarkdownDetail.module.css";

interface MarkdownDetailProps {
  source: string;
}

export function MarkdownDetail({ source }: MarkdownDetailProps) {
  return (
    <div className={styles.md}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlightCurated]}
        skipHtml
        components={{
          a: ({ href, children, ...rest }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
              {children}
            </a>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
