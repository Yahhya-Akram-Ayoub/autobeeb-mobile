import React, { useCallback, useEffect, useRef, useState } from "react";

export const useAsyncSetStateFunction = (state, setState) => {
  // hold resolution function for all setState calls still unresolved
  const resolvers = useRef([]);

  // ensure resolvers are called once state updates have been applied
  useEffect(() => {
    resolvers.current.forEach((resolve) => resolve(state));
    resolvers.current = [];
  }, [state]);

  // make setState return a promise
  return useCallback(
    (stateUpdate) => {
      return new Promise((resolve, reject) => {
        setState((stateBefore) => {
          try {
            const stateAfter =
              stateUpdate instanceof Function
                ? stateUpdate(stateBefore)
                : stateUpdate;

            // If state does not change, we must resolve the promise because react won't re-render and effect will not resolve
            if (stateAfter === stateBefore) {
              resolve(stateAfter);
            }
            // Else we queue resolution until next state change
            else {
              resolvers.current.push(resolve);
            }
            return stateAfter;
          } catch (e) {
            reject(e);
            throw e;
          }
        });
      });
    },
    [setState]
  );
};

export const useAsyncSetState = (initialState) => {
  const [state, setState] = useState(initialState);
  const setStateAsync = useAsyncSetStateFunction(state, setState);
  return [state, setStateAsync];
};

export const useGetState = (state) => {
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
  return useCallback(() => stateRef.current, [stateRef]);
};
