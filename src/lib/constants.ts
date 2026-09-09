/**
 * Shared `accept` attribute for upload fields that take either an image or a
 * video (Project asset slots, Case Study Hero/Showcase media). Extracted from
 * `ProjectForm.tsx`, which had it inlined as a private constant, so
 * `MediaField.tsx` doesn't duplicate it (root CLAUDE.md Rule 6).
 */
export const ASSET_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";
