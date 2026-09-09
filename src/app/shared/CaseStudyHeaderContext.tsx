"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CaseStudyHeaderSibling = { title: string; slug: string } | null;

type CaseStudyHeaderInfo = {
  title: string;
  previousCaseStudy: CaseStudyHeaderSibling;
  nextCaseStudy: CaseStudyHeaderSibling;
} | null;

type CaseStudyHeaderContextValue = {
  info: CaseStudyHeaderInfo;
  setInfo: (info: CaseStudyHeaderInfo) => void;
};

const CaseStudyHeaderContext =
  createContext<CaseStudyHeaderContextValue | null>(null);

/**
 * Wraps `Header` and `children` in the root layout. `Header` renders above
 * `children`, so it has no other way to learn a case study's title/siblings —
 * a case-study page publishes them up through this context instead of
 * `Header` reaching down into page data.
 */
export function CaseStudyHeaderProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<CaseStudyHeaderInfo>(null);
  const value = useMemo(() => ({ info, setInfo }), [info]);

  return (
    <CaseStudyHeaderContext.Provider value={value}>
      {children}
    </CaseStudyHeaderContext.Provider>
  );
}

export function useCaseStudyHeaderInfo() {
  return useContext(CaseStudyHeaderContext)?.info ?? null;
}

/**
 * Mounted by a case-study page to publish its title and prev/next siblings
 * into the Header. Clears itself on unmount so navigating to a page without
 * this mounted never leaves stale info showing.
 */
export function CaseStudyHeaderTitle({
  title,
  previousCaseStudy = null,
  nextCaseStudy = null,
}: {
  title: string;
  previousCaseStudy?: CaseStudyHeaderSibling;
  nextCaseStudy?: CaseStudyHeaderSibling;
}) {
  // Read only the setter, not the whole `{ info, setInfo }` record: that
  // record is rebuilt (new identity) every time `info` changes, and this
  // effect calling `setInfo` is exactly what changes `info` — depending on
  // the record itself would re-fire the effect on its own output forever.
  // `setInfo` (a raw `useState` setter) is stable across renders, so this
  // effect only re-runs when the published title/siblings actually change.
  const setInfo = useContext(CaseStudyHeaderContext)?.setInfo;

  useEffect(() => {
    setInfo?.({ title, previousCaseStudy, nextCaseStudy });
    return () => setInfo?.(null);
  }, [setInfo, title, previousCaseStudy, nextCaseStudy]);

  return null;
}
