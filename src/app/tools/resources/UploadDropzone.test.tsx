jest.mock("./api", () => ({
  uploadResource: jest.fn(),
}));

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UploadDropzone } from "./UploadDropzone";
import { uploadResource } from "./api";
import type { Resource } from "@/lib/supabase/types";

const sample: Resource = {
  id: "r1",
  bucket: "resources",
  storage_path: "r1/a.png",
  filename: "a.png",
  label: "a",
  mime_type: "image/png",
  size_bytes: 10,
  created_at: "2026-05-11T00:00:00Z",
};

beforeEach(() => jest.clearAllMocks());

describe("UploadDropzone", () => {
  it("dropping a file triggers uploadResource and onUploaded", async () => {
    (uploadResource as jest.Mock).mockResolvedValue(sample);
    const onUploaded = jest.fn();
    const { container } = render(<UploadDropzone onUploaded={onUploaded} />);
    const dropzone = container.querySelector('[role="button"]')!;
    const file = new File(["x"], "a.png", { type: "image/png" });
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    });
    await waitFor(() => expect(uploadResource).toHaveBeenCalledWith(file));
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(sample));
  });

  it("file input change triggers uploadResource", async () => {
    (uploadResource as jest.Mock).mockResolvedValue(sample);
    const onUploaded = jest.fn();
    const { container } = render(<UploadDropzone onUploaded={onUploaded} />);
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(["x"], "a.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(uploadResource).toHaveBeenCalledWith(file));
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(sample));
  });

  it("shows error when upload fails", async () => {
    (uploadResource as jest.Mock).mockRejectedValue(new Error("Quota"));
    render(<UploadDropzone onUploaded={jest.fn()} />);
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(["x"], "big.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(screen.getByText(/Quota/)).toBeInTheDocument());
    expect(screen.getByText("big.png")).toBeInTheDocument();
  });
});
