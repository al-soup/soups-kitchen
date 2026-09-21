import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { linkifyText } from "./linkifyText";

function renderText(input: string) {
  return render(<>{linkifyText(input)}</>);
}

describe("linkifyText", () => {
  it("returns plain text unchanged when no URL is present", () => {
    const { container, queryByRole } = renderText("just a plain note");
    expect(queryByRole("link")).toBeNull();
    expect(container.textContent).toBe("just a plain note");
  });

  it("wraps a single URL in an external anchor", () => {
    const { getByRole } = renderText("see https://example.com here");
    const link = getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link.textContent).toBe("https://example.com");
  });

  it("strips trailing punctuation from the URL", () => {
    const { getByRole, container } = renderText("visit https://example.com.");
    expect(getByRole("link")).toHaveAttribute("href", "https://example.com");
    expect(container.textContent).toBe("visit https://example.com.");
  });

  it("renders multiple URLs interleaved with text in order", () => {
    const { getAllByRole, container } = renderText(
      "go to https://a.test then https://b.test/path done"
    );
    const links = getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "https://a.test");
    expect(links[1]).toHaveAttribute("href", "https://b.test/path");
    expect(container.textContent).toBe(
      "go to https://a.test then https://b.test/path done"
    );
  });

  it("ignores non-http(s) schemes", () => {
    const { queryByRole, container } = renderText(
      "no javascript:alert(1) or ftp://example.com here"
    );
    expect(queryByRole("link")).toBeNull();
    expect(container.textContent).toBe(
      "no javascript:alert(1) or ftp://example.com here"
    );
  });

  it("preserves newline characters between segments", () => {
    const { container, getByRole } = renderText("line1\nhttps://x.test\nend");
    expect(getByRole("link")).toHaveAttribute("href", "https://x.test");
    expect(container.textContent).toBe("line1\nhttps://x.test\nend");
  });
});
