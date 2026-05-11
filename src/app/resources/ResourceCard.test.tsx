jest.mock("./api", () => ({
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
import { ResourceCard } from "./ResourceCard";
import type { Resource } from "@/lib/supabase/types";

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

const resource: Resource = {
  id: "r1",
  bucket: "resources",
  storage_path: "r1/diagram.png",
  filename: "Diagram.png",
  label: "Diagram",
  mime_type: "image/png",
  size_bytes: 2048,
  created_at: "2026-05-11T12:00:00Z",
};

const pdfResource: Resource = {
  ...resource,
  id: "r2",
  storage_path: "r2/spec.pdf",
  filename: "Spec.pdf",
  label: "Spec",
  mime_type: "application/pdf",
};

beforeEach(() => jest.clearAllMocks());

describe("ResourceCard", () => {
  it("renders label, filename, and formatted size", async () => {
    render(
      <ResourceCard
        resource={resource}
        onRename={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    await flushEffects();
    expect(
      screen.getByRole("button", { name: /rename diagram/i })
    ).toHaveTextContent("Diagram");
    expect(screen.getByText(/Diagram.png/)).toBeInTheDocument();
    expect(screen.getByText(/2\.0 KB/)).toBeInTheDocument();
  });

  it("shows mime badge for non-image/video resources", () => {
    render(
      <ResourceCard
        resource={pdfResource}
        onRename={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText("pdf")).toBeInTheDocument();
  });

  it("Enter commits rename via onRename", async () => {
    const onRename = jest.fn().mockResolvedValue(undefined);
    render(
      <ResourceCard
        resource={resource}
        onRename={onRename}
        onDelete={jest.fn()}
      />
    );
    await flushEffects();
    fireEvent.click(screen.getByRole("button", { name: /rename diagram/i }));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "B-tree diagram" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() =>
      expect(onRename).toHaveBeenCalledWith("r1", "B-tree diagram")
    );
  });

  it("Escape cancels rename without calling onRename", async () => {
    const onRename = jest.fn();
    render(
      <ResourceCard
        resource={resource}
        onRename={onRename}
        onDelete={jest.fn()}
      />
    );
    await flushEffects();
    fireEvent.click(screen.getByRole("button", { name: /rename diagram/i }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Changed" },
    });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(onRename).not.toHaveBeenCalled();
  });

  it("empty label shows inline error", async () => {
    const onRename = jest.fn();
    render(
      <ResourceCard
        resource={resource}
        onRename={onRename}
        onDelete={jest.fn()}
      />
    );
    await flushEffects();
    fireEvent.click(screen.getByRole("button", { name: /rename diagram/i }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "  " } });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByText("Label required")).toBeInTheDocument();
  });

  it("delete confirms then calls onDelete", async () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const onDelete = jest.fn().mockResolvedValue(undefined);
    render(
      <ResourceCard
        resource={resource}
        onRename={jest.fn()}
        onDelete={onDelete}
      />
    );
    await flushEffects();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(resource));
    confirmSpy.mockRestore();
  });

  it("delete does nothing if confirm cancelled", async () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);
    const onDelete = jest.fn();
    render(
      <ResourceCard
        resource={resource}
        onRename={jest.fn()}
        onDelete={onDelete}
      />
    );
    await flushEffects();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("copy-token writes placeholder token to clipboard", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(
      <ResourceCard
        resource={resource}
        onRename={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    await flushEffects();
    fireEvent.click(screen.getByRole("button", { name: "Copy token" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("{{resource:r1}}")
    );
    expect(
      await screen.findByRole("button", { name: "Copied!" })
    ).toBeInTheDocument();
  });
});
