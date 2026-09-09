import { apiFetch } from "./client";
import type { AssetResponse } from "./types";

function toFormData(file: File): FormData {
  const formData = new FormData();
  // Field name is dictated by the backend's multer config
  // (`uploadImage` -> `.single("image")`).
  formData.append("image", file);
  return formData;
}

/** Uploads a new asset (jpeg/png/webp/gif, 8MB max). Admin-only. */
export async function uploadAsset(file: File): Promise<AssetResponse> {
  return apiFetch<AssetResponse>("/api/assets", {
    method: "POST",
    body: toFormData(file),
  });
}

/** Replaces an existing asset's file in place — the assetId is unchanged. */
export async function replaceAsset(
  assetId: string,
  file: File
): Promise<AssetResponse> {
  return apiFetch<AssetResponse>(`/api/assets/${assetId}`, {
    method: "PATCH",
    body: toFormData(file),
  });
}

export async function deleteAsset(assetId: string): Promise<{ assetId: string }> {
  return apiFetch<{ assetId: string }>(`/api/assets/${assetId}`, {
    method: "DELETE",
  });
}
