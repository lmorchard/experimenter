/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { waitFor } from "@testing-library/dom";
import { act, renderHook } from "@testing-library/react-hooks";
import { useBooleanState } from "./useBooleanState";

describe("hooks/useBooleanState", () => {
  it("supports setState", async () => {
    const { result } = renderHook(() => useBooleanState(false));
    expect(result.current.state).toEqual(false);
    act(() => result.current.setState(true));
    expect(result.current.state).toEqual(true);
    act(() => result.current.setState(false));
    expect(result.current.state).toEqual(false);
  });
  it("supports toggleState", async () => {
    const { result } = renderHook(() => useBooleanState(false));
    expect(result.current.state).toEqual(false);
    act(() => result.current.toggleState());
    expect(result.current.state).toEqual(true);
    act(() => result.current.toggleState());
    expect(result.current.state).toEqual(false);
  });
  it("supports setStateTrue", async () => {
    const { result } = renderHook(() => useBooleanState(false));
    expect(result.current.state).toEqual(false);
    act(() => result.current.setStateTrue());
    expect(result.current.state).toEqual(true);
  });
  it("supports setStateFalse", async () => {
    const { result } = renderHook(() => useBooleanState(true));
    expect(result.current.state).toEqual(true);
    act(() => result.current.setStateFalse());
    expect(result.current.state).toEqual(false);
  });
});
