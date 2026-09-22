import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { TagBreadcrumb } from "./TagBreadcrumb";
import type { Tag } from "@/lib/supabase/types";

const topic: Tag = { id: "t1", name: "Databases", type: "topic" };
const c1: Tag = { id: "c1", name: "Caching", type: "concept" };
const c2: Tag = { id: "c2", name: "REST", type: "concept" };

describe("TagBreadcrumb", () => {
  it("renders topic / concept", () => {
    const { container } = render(<TagBreadcrumb tags={[topic, c1]} />);
    expect(container.textContent).toBe("Databases/Caching");
  });

  it("comma-separates multiple concepts", () => {
    const { container } = render(<TagBreadcrumb tags={[c2, topic, c1]} />);
    expect(container.textContent).toBe("Databases/REST,Caching");
  });

  it("renders nothing without tags", () => {
    const { container } = render(<TagBreadcrumb tags={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
