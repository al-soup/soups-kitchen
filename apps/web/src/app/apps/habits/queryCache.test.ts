import { act, renderHook, waitFor } from "@testing-library/react";
import { invalidateHabitsCache, useCachedQuery } from "./queryCache";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useCachedQuery", () => {
  beforeEach(() => {
    invalidateHabitsCache();
    jest.useRealTimers();
  });

  it("loads on a miss and serves the result", async () => {
    const fetcher = jest.fn(async () => "v1");
    const { result } = renderHook(() => useCachedQuery("k", fetcher));

    expect(result.current).toEqual({ data: null, loading: true, error: null });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe("v1");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("serves a fresh entry without fetching again", async () => {
    const fetcher = jest.fn(async () => "v1");
    const first = renderHook(() => useCachedQuery("k", fetcher));
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    first.unmount();

    const second = renderHook(() => useCachedQuery("k", fetcher));
    expect(second.result.current).toEqual({
      data: "v1",
      loading: false,
      error: null,
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("dedupes concurrent fetches of one key", async () => {
    const { promise, resolve } = deferred<string>();
    const fetcher = jest.fn(() => promise);
    const a = renderHook(() => useCachedQuery("k", fetcher));
    const b = renderHook(() => useCachedQuery("k", fetcher));

    await act(async () => resolve("v1"));
    await waitFor(() => expect(a.result.current.data).toBe("v1"));
    expect(b.result.current.data).toBe("v1");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("serves a stale entry while revalidating", async () => {
    jest.useFakeTimers();
    const fetcher = jest
      .fn<Promise<string>, []>()
      .mockResolvedValueOnce("v1")
      .mockResolvedValueOnce("v2");
    const first = renderHook(() => useCachedQuery("k", fetcher));
    await act(async () => {
      await Promise.resolve();
    });
    expect(first.result.current.data).toBe("v1");
    first.unmount();

    jest.advanceTimersByTime(6 * 60 * 1000);
    const second = renderHook(() => useCachedQuery("k", fetcher));
    expect(second.result.current).toEqual({
      data: "v1",
      loading: false,
      error: null,
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(second.result.current.data).toBe("v2");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("refetches after invalidation", async () => {
    const fetcher = jest
      .fn<Promise<string>, []>()
      .mockResolvedValueOnce("v1")
      .mockResolvedValueOnce("v2");
    const { result } = renderHook(() => useCachedQuery("k", fetcher));
    await waitFor(() => expect(result.current.data).toBe("v1"));

    act(() => invalidateHabitsCache());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.data).toBe("v2"));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("drops a result that started before invalidation", async () => {
    const { promise, resolve } = deferred<string>();
    const fetcher = jest.fn(() => promise);
    const { result } = renderHook(() => useCachedQuery("k", fetcher));

    act(() => invalidateHabitsCache());
    await act(async () => resolve("old"));
    expect(result.current.data).not.toBe("old");
  });

  it("reports a failed load and does not cache it", async () => {
    const fetcher = jest.fn(async () => {
      throw new Error("boom");
    });
    const { result } = renderHook(() => useCachedQuery("k", fetcher));
    await waitFor(() => expect(result.current.error).toBe("boom"));
    expect(result.current).toEqual({
      data: null,
      loading: false,
      error: "boom",
    });
  });

  it("switching keys never shows the previous key's data", async () => {
    const fetcher = jest.fn(async () => "v1");
    const { result, rerender } = renderHook(
      ({ key }) => useCachedQuery(key, fetcher),
      { initialProps: { key: "a" } }
    );
    await waitFor(() => expect(result.current.data).toBe("v1"));

    rerender({ key: "b" });
    expect(result.current).toEqual({ data: null, loading: true, error: null });
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
