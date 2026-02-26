import { getCachedActions, setCachedActions } from "./actionsCache";
import type { Action } from "./supabase/types";

const CACHE_KEY = "sk_actions_cache";

const mockActions: Action[] = [
  { id: 1, name: "Run", description: null, type: 1, level: 1 },
  { id: 2, name: "Meditate", description: null, type: 2, level: 3 },
];

beforeEach(() => localStorage.clear());

describe("getCachedActions", () => {
  it("returns null when cache is empty", () => {
    expect(getCachedActions()).toBeNull();
  });

  it("returns data when cache is fresh", () => {
    setCachedActions(mockActions);
    expect(getCachedActions()).toEqual(mockActions);
  });

  it("returns null when cache is older than 24 h", () => {
    const expired = {
      data: mockActions,
      cachedAt: Date.now() - 25 * 60 * 60 * 1000,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(expired));
    expect(getCachedActions()).toBeNull();
  });

  it("returns null for corrupt JSON", () => {
    localStorage.setItem(CACHE_KEY, "not-json");
    expect(getCachedActions()).toBeNull();
  });
});

describe("setCachedActions", () => {
  it("writes data that can be retrieved", () => {
    setCachedActions(mockActions);
    expect(getCachedActions()).toEqual(mockActions);
  });
});
