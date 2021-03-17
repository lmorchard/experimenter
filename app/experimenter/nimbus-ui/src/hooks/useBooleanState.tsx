/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { useMemo, useState } from "react";

export function useBooleanState(defval = false) {
  const [state, setState] = useState(defval);
  return {
    state,
    setState,
    ...useMemo(
      () => ({
        toggleState: () => setState((state) => !state),
        setStateTrue: () => setState(true),
        setStateFalse: () => setState(false),
      }),
      [setState],
    ),
  };
}
