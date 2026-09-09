"use client";

import { useEffect, useRef } from "react";

/**
 * Runs `handler` on Escape, for as long as the calling component is mounted.
 *
 * Owned by whichever component the key should act on, rather than by the
 * modal shell: the contact panel has a nested dropdown that Escape must
 * close *first*, and a single owner per panel is what keeps that decision in
 * one place. Two `document` listeners racing each other would not — React's
 * `stopPropagation()` cannot stop a native listener bound to the same node
 * (in the App Router, React's own delegated listener is on `document` too),
 * so the ordering could not be relied on.
 *
 * The handler is read through a ref so a fresh closure each render doesn't
 * detach and re-attach the listener.
 */
export function useEscapeKey(handler: () => void) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handlerRef.current();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}
