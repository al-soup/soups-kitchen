import { Fragment, type ReactNode } from "react";

const URL_REGEX = /\bhttps?:\/\/[^\s<>]+/g;
const TRAILING_PUNCT = /[.,;:!?)\]}'"]+$/;

export function linkifyText(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    let url = match[0];
    const start = match.index!;
    const trailing = url.match(TRAILING_PUNCT);
    if (trailing) url = url.slice(0, -trailing[0].length);

    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    parts.push(
      <a key={start} href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>
    );
    lastIndex = start + url.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <Fragment>{parts}</Fragment>;
}
