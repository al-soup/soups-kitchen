jest.mock("@/app/resources/api", () => ({
  listResources: jest.fn(),
  getSignedUrl: jest.fn().mockResolvedValue("https://signed.example/x"),
  placeholderToken: (id: string) => `{{resource:${id}}}`,
}));

import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { ResourcePickerModal } from "./ResourcePickerModal";
import { listResources } from "@/app/resources/api";
import type { Resource } from "@/lib/supabase/types";

const resources: Resource[] = [
  {
    id: "r1",
    bucket: "resources",
    storage_path: "r1/diagram.png",
    filename: "Diagram.png",
    label: "B-tree diagram",
    mime_type: "image/png",
    size_bytes: 1024,
    created_at: "2026-05-11T00:00:00Z",
  },
  {
    id: "r2",
    bucket: "resources",
    storage_path: "r2/notes.pdf",
    filename: "notes.pdf",
    label: "Caching notes",
    mime_type: "application/pdf",
    size_bytes: 2048,
    created_at: "2026-05-11T01:00:00Z",
  },
];

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => jest.clearAllMocks());

describe("ResourcePickerModal", () => {
  it("renders nothing when closed", () => {
    render(
      <ResourcePickerModal
        open={false}
        onClose={jest.fn()}
        onPick={jest.fn()}
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("loads resources on open and renders tiles", async () => {
    (listResources as jest.Mock).mockResolvedValue(resources);
    render(
      <ResourcePickerModal open={true} onClose={jest.fn()} onPick={jest.fn()} />
    );
    await waitFor(() =>
      expect(screen.getByText("B-tree diagram")).toBeInTheDocument()
    );
    expect(screen.getByText("Caching notes")).toBeInTheDocument();
    await flushEffects();
  });

  it("clicking a tile calls onPick with the placeholder token and onClose", async () => {
    (listResources as jest.Mock).mockResolvedValue(resources);
    const onPick = jest.fn();
    const onClose = jest.fn();
    render(
      <ResourcePickerModal open={true} onClose={onClose} onPick={onPick} />
    );
    await waitFor(() =>
      expect(screen.getByText("B-tree diagram")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("B-tree diagram"));
    expect(onPick).toHaveBeenCalledWith(
      "{{resource:r1}}",
      expect.objectContaining({ id: "r1" })
    );
    expect(onClose).toHaveBeenCalled();
    await flushEffects();
  });

  it("filters by query against label and filename", async () => {
    (listResources as jest.Mock).mockResolvedValue(resources);
    render(
      <ResourcePickerModal open={true} onClose={jest.fn()} onPick={jest.fn()} />
    );
    await waitFor(() =>
      expect(screen.getByText("B-tree diagram")).toBeInTheDocument()
    );
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "notes" },
    });
    expect(screen.queryByText("B-tree diagram")).not.toBeInTheDocument();
    expect(screen.getByText("Caching notes")).toBeInTheDocument();
    await flushEffects();
  });

  it("Escape key closes the modal", async () => {
    (listResources as jest.Mock).mockResolvedValue(resources);
    const onClose = jest.fn();
    render(
      <ResourcePickerModal open={true} onClose={onClose} onPick={jest.fn()} />
    );
    await waitFor(() => expect(listResources).toHaveBeenCalled());
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
    await flushEffects();
  });
});
