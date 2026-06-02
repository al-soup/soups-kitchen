jest.mock("./useUserRole", () => ({
  useUserRole: jest.fn(),
}));

import { renderHook } from "@testing-library/react";
import { useUserRole } from "./useUserRole";
import { useCanManage } from "./useCanManage";

const mockUseUserRole = useUserRole as jest.MockedFunction<typeof useUserRole>;

describe("useCanManage", () => {
  it("returns canManage=true for manager", () => {
    mockUseUserRole.mockReturnValue({ role: "manager", loading: false });
    const { result } = renderHook(() => useCanManage("knowledge"));
    expect(result.current).toEqual({ canManage: true, loading: false });
  });

  it("returns canManage=true for admin", () => {
    mockUseUserRole.mockReturnValue({ role: "admin", loading: false });
    const { result } = renderHook(() => useCanManage("knowledge"));
    expect(result.current.canManage).toBe(true);
  });

  it("returns canManage=false for viewer", () => {
    mockUseUserRole.mockReturnValue({ role: "viewer", loading: false });
    const { result } = renderHook(() => useCanManage("knowledge"));
    expect(result.current.canManage).toBe(false);
  });

  it("returns canManage=false for anon (role null)", () => {
    mockUseUserRole.mockReturnValue({ role: null, loading: false });
    const { result } = renderHook(() => useCanManage("knowledge"));
    expect(result.current.canManage).toBe(false);
  });

  it("propagates loading state", () => {
    mockUseUserRole.mockReturnValue({ role: null, loading: true });
    const { result } = renderHook(() => useCanManage("knowledge"));
    expect(result.current.loading).toBe(true);
  });
});
