"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rehypeMarkQuery } from "./rehypeMarkQuery";
import styles from "./MarkdownSummary.module.css";

interface MarkdownSummaryProps {
  source: string;
  disableLinks?: boolean;
  highlight?: string;
}

export function MarkdownSummary({
  source,
  disableLinks = false,
  highlight,
}: MarkdownSummaryProps) {
  return (
    <div className={styles.md}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeMarkQuery, highlight]]}
        skipHtml
        components={{
          a: ({ href, children, ...rest }) =>
            disableLinks ? (
              <span>{children}</span>
            ) : (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                {...rest}
              >
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
