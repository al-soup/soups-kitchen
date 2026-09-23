jest.mock("./api", () => ({ listRelatedKnowledge: jest.fn() }));
// next/dynamic never resolves under jsdom; the markdown pipeline is covered
// by MarkdownInline's own tests.
jest.mock("next/dynamic", () => () => {
  const Plain = ({ source }: { source: string }) => <>{source}</>;
  return Plain;
});

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { RelatedEntries } from "./RelatedEntries";
import { listRelatedKnowledge } from "./api";
import type { RelatedKnowledge } from "@/lib/supabase/types";

const rows: RelatedKnowledge[] = [
  {
    id: 7,
    question: "Hash index vs B-tree",
    topicName: "Databases",
    tags: [
      { id: "t1", name: "Databases", type: "topic" },
      { id: "c1", name: "DB Indexing", type: "concept" },
    ],
  },
  {
    id: 13,
    question: "Why is SELECT * discouraged?",
    topicName: null,
    tags: [],
  },
];

beforeEach(() => jest.clearAllMocks());

describe("RelatedEntries", () => {
  it("links related entries with their tags", async () => {
    (listRelatedKnowledge as jest.Mock).mockResolvedValue(rows);
    render(<RelatedEntries entryId={1} />);

    const nav = await screen.findByRole("navigation", {
      name: "Related entries",
    });
    expect(listRelatedKnowledge).toHaveBeenCalledWith(1);
    expect(
      screen.getByRole("link", { name: /Hash index vs B-tree/ })
    ).toHaveAttribute("href", "/apps/knowledge-base/7");
    expect(nav).toHaveTextContent("DB Indexing");
    expect(screen.getByRole("link", { name: "All entries →" })).toHaveAttribute(
      "href",
      "/apps/knowledge-base"
    );
  });

  it("shows only the All entries link when nothing is related", async () => {
    (listRelatedKnowledge as jest.Mock).mockResolvedValue([]);
    render(<RelatedEntries entryId={1} />);

    expect(
      screen.getByRole("link", { name: "All entries →" })
    ).toBeInTheDocument();
    await waitFor(() => expect(listRelatedKnowledge).toHaveBeenCalled());
    expect(
      screen.queryByRole("navigation", { name: "Related entries" })
    ).not.toBeInTheDocument();
  });

  it("swallows a failed lookup", async () => {
    (listRelatedKnowledge as jest.Mock).mockRejectedValue(new Error("boom"));
    render(<RelatedEntries entryId={1} />);

    await waitFor(() => expect(listRelatedKnowledge).toHaveBeenCalled());
    expect(
      screen.getByRole("link", { name: "All entries →" })
    ).toBeInTheDocument();
    expect(screen.queryByText("boom")).not.toBeInTheDocument();
  });
});
