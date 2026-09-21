import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchBox } from "./SearchBox";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe("SearchBox", () => {
  it("renders initial value", () => {
    render(<SearchBox initialValue="hello" onDebouncedChange={jest.fn()} />);
    expect(screen.getByRole("textbox")).toHaveValue("hello");
  });

  it("fires onDebouncedChange once after the debounce window", () => {
    const cb = jest.fn();
    render(
      <SearchBox initialValue="" onDebouncedChange={cb} debounceMs={250} />
    );
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.change(input, { target: { value: "ab" } });
    fireEvent.change(input, { target: { value: "abc" } });

    expect(cb).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith("abc");
  });

  it("trims whitespace before emitting", () => {
    const cb = jest.fn();
    render(<SearchBox initialValue="" onDebouncedChange={cb} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "  query  " },
    });
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(cb).toHaveBeenCalledWith("query");
  });

  it("clear button cancels pending timer and emits empty synchronously", () => {
    const cb = jest.fn();
    render(<SearchBox initialValue="seed" onDebouncedChange={cb} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "newval" } });

    const clearBtn = screen.getByLabelText("Clear search");
    fireEvent.click(clearBtn);

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith("");
    expect(input).toHaveValue("");

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("hides clear button when input is empty", () => {
    render(<SearchBox initialValue="" onDebouncedChange={jest.fn()} />);
    expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();
  });

  it("syncs to a changed initialValue without remounting", () => {
    const cb = jest.fn();
    const { rerender } = render(
      <SearchBox initialValue="foo" onDebouncedChange={cb} />
    );
    expect(screen.getByRole("textbox")).toHaveValue("foo");

    rerender(<SearchBox initialValue="bar" onDebouncedChange={cb} />);
    expect(screen.getByRole("textbox")).toHaveValue("bar");
  });

  it("cancels pending debounce when initialValue changes externally", () => {
    const cb = jest.fn();
    const { rerender } = render(
      <SearchBox initialValue="" onDebouncedChange={cb} />
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "abc" } });

    // External value swap (e.g. browser back) before debounce fires.
    rerender(<SearchBox initialValue="external" onDebouncedChange={cb} />);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(cb).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).toHaveValue("external");
  });
});
