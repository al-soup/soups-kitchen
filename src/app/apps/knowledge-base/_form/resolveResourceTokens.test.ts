import type { ResolvedResource } from "@/app/resources/api";
import {
  extractResourceIds,
  replaceResourceTokens,
} from "./resolveResourceTokens";

const ID_A = "11111111-1111-1111-1111-111111111111";
const ID_B = "22222222-2222-2222-2222-222222222222";

describe("extractResourceIds", () => {
  it("returns empty for nullish input", () => {
    expect(extractResourceIds(null)).toEqual([]);
    expect(extractResourceIds(undefined)).toEqual([]);
    expect(extractResourceIds("")).toEqual([]);
  });

  it("finds unique ids across the markdown", () => {
    const md = `intro {{resource:${ID_A}}} middle {{resource:${ID_B}}} again {{resource:${ID_A}}}`;
    expect(extractResourceIds(md)).toEqual([ID_A, ID_B]);
  });

  it("ignores tokens with malformed ids", () => {
    expect(extractResourceIds("{{resource:not-a-uuid}}")).toEqual([]);
  });
});

describe("replaceResourceTokens", () => {
  function lookup(
    entries: Record<string, Partial<ResolvedResource>>
  ): Record<string, ResolvedResource> {
    const out: Record<string, ResolvedResource> = {};
    for (const [id, v] of Object.entries(entries)) {
      out[id] = {
        url: v.url ?? null,
        mime: v.mime ?? null,
        filename: v.filename ?? null,
      };
    }
    return out;
  }

  it("renders an image when mime starts with image/", () => {
    const md = `head {{resource:${ID_A}}} tail`;
    const out = replaceResourceTokens(
      md,
      lookup({
        [ID_A]: {
          url: "https://signed/x.png",
          mime: "image/png",
          filename: "x.png",
        },
      })
    );
    expect(out).toBe("head ![x.png](https://signed/x.png) tail");
  });

  it("renders a link for non-image mime", () => {
    const md = `see {{resource:${ID_A}}}`;
    const out = replaceResourceTokens(
      md,
      lookup({
        [ID_A]: {
          url: "https://signed/x.pdf",
          mime: "application/pdf",
          filename: "x.pdf",
        },
      })
    );
    expect(out).toBe("see [x.pdf](https://signed/x.pdf)");
  });

  it("emits a missing marker when url is null", () => {
    const md = `before {{resource:${ID_A}}} after`;
    const out = replaceResourceTokens(
      md,
      lookup({ [ID_A]: { url: null, mime: "image/png", filename: "x.png" } })
    );
    expect(out).toBe("before ~~missing resource~~ after");
  });

  it("falls back to 'resource' alt text when filename is null", () => {
    const md = `{{resource:${ID_A}}}`;
    const out = replaceResourceTokens(
      md,
      lookup({ [ID_A]: { url: "u", mime: "image/png" } })
    );
    expect(out).toBe("![resource](u)");
  });
});
