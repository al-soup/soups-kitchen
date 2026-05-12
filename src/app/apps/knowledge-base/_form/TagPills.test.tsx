import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { TagPills } from "./TagPills";
import type { Tag } from "@/lib/supabase/types";

const tags: Tag[] = [
  { id: "t1", name: "Databases", type: "topic" },
  { id: "t2", name: "Networking", type: "topic" },
];

describe("TagPills", () => {
  it("renders nothing when tags is empty", () => {
    const { container } = render(
      <TagPills
        tags={[]}
        selectedIds={[]}
        onToggle={jest.fn()}
        variant="topic"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one button per tag", () => {
    render(
      <TagPills
        tags={tags}
        selectedIds={[]}
        onToggle={jest.fn()}
        variant="topic"
      />
    );
    expect(screen.getByText("Databases")).toBeInTheDocument();
    expect(screen.getByText("Networking")).toBeInTheDocument();
  });

  it("marks selected tags via aria-pressed", () => {
    render(
      <TagPills
        tags={tags}
        selectedIds={["t1"]}
        onToggle={jest.fn()}
        variant="topic"
      />
    );
    expect(screen.getByText("Databases")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByText("Networking")).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("fires onToggle with the tag id on click", () => {
    const onToggle = jest.fn();
    render(
      <TagPills
        tags={tags}
        selectedIds={[]}
        onToggle={onToggle}
        variant="topic"
      />
    );
    fireEvent.click(screen.getByText("Databases"));
    expect(onToggle).toHaveBeenCalledWith("t1");
  });
});
