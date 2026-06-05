"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownInlineProps {
  source: string;
}

export function MarkdownInline({ source }: MarkdownInlineProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
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
