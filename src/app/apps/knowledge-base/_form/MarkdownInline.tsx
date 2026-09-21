"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rehypeMarkQuery } from "./rehypeMarkQuery";

interface MarkdownInlineProps {
  source: string;
  highlight?: string;
}

export function MarkdownInline({ source, highlight }: MarkdownInlineProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeMarkQuery, highlight]]}
      skipHtml
      components={{
        p: ({ children }) => <>{children}</>,
        a: ({ href, children, ...rest }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
            {children}
          </a>
        ),
      }}
    >
      {source}
    </ReactMarkdown>
  );
}
