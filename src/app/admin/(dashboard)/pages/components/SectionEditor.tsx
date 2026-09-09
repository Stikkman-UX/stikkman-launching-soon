"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { replaceAsset, uploadAsset } from "@/lib/api/assets";
import {
  fetchCaseStudySectionForAdmin,
  resetCaseStudySection,
  saveCaseStudySection,
} from "@/lib/api/caseStudies";
import type {
  AboutUsSection,
  CaseStudySection,
  NavigationSection,
  SectorSection,
  ServiceSection,
} from "@/lib/api/types";
import { resolveErrorMessage } from "@/lib/api/errors";
import {
  fetchSectionForAdmin,
  resetPageSection,
  savePageSection,
} from "@/lib/api/pages";
import {
  fetchSectorSectionForAdmin,
  resetSectorSection,
  saveSectorSection,
} from "@/lib/api/sectors";
import {
  fetchServiceSectionForAdmin,
  resetServiceSection,
  saveServiceSection,
} from "@/lib/api/services";
import {
  fetchNavigationSectionForAdmin,
  resetNavigationSection,
  saveNavigationSection,
} from "@/lib/api/navigation";
import {
  fetchAboutUsSectionForAdmin,
  resetAboutUsSection,
  saveAboutUsSection,
} from "@/lib/api/aboutUs";
import {
  createEmptyItem,
  parseListValue,
  readPath,
  readString,
  writePath,
  type FieldContext,
  type ListFieldKind,
  type ObjectListField as ObjectListFieldDescriptor,
  type SectionField,
} from "../sectionFields";
import ObjectListField from "./fields/ObjectListField";
import ScalarFieldControl from "./fields/ScalarFields";

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Rewrites `<list>.<index>.…` keys after items move or are removed, so a
 * pending upload or a raw text buffer can't end up attached to the wrong item.
 * `mapIndex` returns the item's new index, or `null` if it's gone.
 */
function remapItemKeys<T>(
  source: Record<string, T>,
  listName: string,
  mapIndex: (index: number) => number | null
): Record<string, T> {
  const prefix = `${listName}.`;
  const next: Record<string, T> = {};

  for (const [key, value] of Object.entries(source)) {
    if (!key.startsWith(prefix)) {
      next[key] = value;
      continue;
    }

    const [rawIndex, ...rest] = key.slice(prefix.length).split(".");
    const moved = mapIndex(Number(rawIndex));

    if (moved !== null) {
      next[`${prefix}${moved}.${rest.join(".")}`] = value;
    }
  }

  return next;
}

/**
 * Backing-resource-agnostic shape the editor needs: enough to seed the form
 * and, optionally, know the current publish state. `PageSection`'s
 * `AdminSectionDoc` and `CaseStudy`'s `AdminCaseStudySectionDoc` both satisfy
 * this structurally without either needing to import the other's type.
 */
export type SectionEditorDoc = {
  content: Record<string, unknown>;
  isPublished?: boolean;
};

export type SectionSavePayload = {
  content: Record<string, unknown>;
  isPublished?: boolean;
};

/**
 * Which backend resource this editor instance is bound to — plain,
 * serializable data only (no closures), since the callers are Server
 * Components and functions can't cross the RSC boundary as props. The editor
 * resolves this into the right `@/lib/api/*` calls itself.
 */
export type SectionEditorTarget =
  | { kind: "page"; page: string; section: string }
  | { kind: "caseStudy"; caseStudyId: string; section: CaseStudySection }
  | { kind: "sector"; sectorId: string; section: SectorSection }
  | { kind: "service"; serviceId: string; section: ServiceSection }
  | { kind: "navigation"; section: NavigationSection }
  | { kind: "aboutUs"; section: AboutUsSection };

function saveSection(
  target: SectionEditorTarget,
  payload: SectionSavePayload
): Promise<SectionEditorDoc> {
  if (target.kind === "page") {
    return savePageSection(target.page, target.section, payload);
  }
  if (target.kind === "caseStudy") {
    return saveCaseStudySection(target.caseStudyId, target.section, {
      content: payload.content,
    });
  }
  if (target.kind === "sector") {
    return saveSectorSection(target.sectorId, target.section, {
      content: payload.content,
    });
  }
  if (target.kind === "service") {
    return saveServiceSection(target.serviceId, target.section, {
      content: payload.content,
    });
  }
  if (target.kind === "navigation") {
    return saveNavigationSection(target.section, { content: payload.content });
  }
  return saveAboutUsSection(target.section, { content: payload.content });
}

function resetSection(target: SectionEditorTarget): Promise<void> {
  if (target.kind === "page") {
    return resetPageSection(target.page, target.section);
  }
  if (target.kind === "caseStudy") {
    return resetCaseStudySection(target.caseStudyId, target.section);
  }
  if (target.kind === "sector") {
    return resetSectorSection(target.sectorId, target.section);
  }
  if (target.kind === "service") {
    return resetServiceSection(target.serviceId, target.section);
  }
  if (target.kind === "navigation") {
    return resetNavigationSection(target.section);
  }
  return resetAboutUsSection(target.section);
}

function reloadSection(target: SectionEditorTarget): Promise<SectionEditorDoc> {
  if (target.kind === "page") {
    return fetchSectionForAdmin(target.page, target.section);
  }
  if (target.kind === "caseStudy") {
    return fetchCaseStudySectionForAdmin(target.caseStudyId, target.section);
  }
  if (target.kind === "sector") {
    return fetchSectorSectionForAdmin(target.sectorId, target.section);
  }
  if (target.kind === "service") {
    return fetchServiceSectionForAdmin(target.serviceId, target.section);
  }
  if (target.kind === "navigation") {
    return fetchNavigationSectionForAdmin(target.section);
  }
  return fetchAboutUsSectionForAdmin(target.section);
}

export default function SectionEditor({
  fields,
  doc,
  showPublishToggle = true,
  target,
}: {
  fields: SectionField[];
  doc: SectionEditorDoc;
  /** `PageSection` sections carry their own `isPublished`; `CaseStudy`
   *  sections don't — that toggle lives only on the parent document, so
   *  callers pass `false` to hide the checkbox entirely. Defaults to `true`
   *  to keep every existing Home section call site unchanged. */
  showPublishToggle?: boolean;
  /** Identifies which section document this editor saves/resets/reloads. */
  target: SectionEditorTarget;
}) {
  const router = useRouter();

  const [content, setContent] = useState<Record<string, unknown>>(doc.content);
  const [isPublished, setIsPublished] = useState(doc.isPublished ?? false);
  const [rawText, setRawText] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [previewIsVideo, setPreviewIsVideo] = useState<Record<string, boolean>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Both a save and a reload answer with the full section document, so every
  // write path re-seeds the form from the backend's own copy — picking up
  // derived slugs and freshly resolved `<field>Url`/`<field>Type` previews.
  function adoptDoc(next: SectionEditorDoc) {
    setContent(next.content);
    setIsPublished(next.isPublished ?? false);
    setRawText({});
    setPendingFiles({});
    setPreviews({});
    setPreviewIsVideo({});
  }

  const ctx: FieldContext = {
    content,
    rawText,
    previews,
    previewIsVideo,
    disabled: isSubmitting,
    setValue(path, value) {
      setSaved(false);
      setContent((prev) => writePath(prev, path, value));
    },
    setRawList(path: string, kind: ListFieldKind, raw: string) {
      setSaved(false);
      setRawText((prev) => ({ ...prev, [path]: raw }));
      setContent((prev) => writePath(prev, path, parseListValue(kind, raw)));
    },
    setFile(path, file) {
      setSaved(false);

      setPreviews((prev) => {
        if (prev[path]) URL.revokeObjectURL(prev[path]);
        const next = { ...prev };

        if (file) {
          const url = URL.createObjectURL(file);
          objectUrlsRef.current.push(url);
          next[path] = url;
        } else {
          delete next[path];
        }

        return next;
      });

      setPreviewIsVideo((prev) => {
        const next = { ...prev };
        if (file) next[path] = file.type.startsWith("video/");
        else delete next[path];
        return next;
      });

      setPendingFiles((prev) => {
        const next = { ...prev };
        if (file) next[path] = file;
        else delete next[path];
        return next;
      });
    },
  };

  function remapItemState(
    listName: string,
    mapIndex: (index: number) => number | null
  ) {
    setRawText((prev) => remapItemKeys(prev, listName, mapIndex));
    setPendingFiles((prev) => remapItemKeys(prev, listName, mapIndex));
    setPreviews((prev) => remapItemKeys(prev, listName, mapIndex));
    setPreviewIsVideo((prev) => remapItemKeys(prev, listName, mapIndex));
  }

  function handleAddItem(field: ObjectListFieldDescriptor) {
    setSaved(false);
    setContent((prev) =>
      writePath(prev, field.name, [
        ...asArray(readPath(prev, field.name)),
        createEmptyItem(field),
      ])
    );
  }

  function handleRemoveItem(field: ObjectListFieldDescriptor, index: number) {
    const confirmed = window.confirm(
      `Remove ${field.itemLabel.toLowerCase()} ${index + 1}? This cannot be undone.`
    );
    if (!confirmed) return;

    setSaved(false);
    setContent((prev) =>
      writePath(
        prev,
        field.name,
        asArray(readPath(prev, field.name)).filter((_, i) => i !== index)
      )
    );
    remapItemState(field.name, (i) =>
      i === index ? null : i > index ? i - 1 : i
    );
  }

  function handleMoveItem(
    field: ObjectListFieldDescriptor,
    index: number,
    direction: -1 | 1
  ) {
    const items = asArray(readPath(content, field.name));
    const target = index + direction;

    if (target < 0 || target >= items.length) return;

    const swapped = [...items];
    [swapped[index], swapped[target]] = [swapped[target], swapped[index]];

    setSaved(false);
    setContent((prev) => writePath(prev, field.name, swapped));
    remapItemState(field.name, (i) =>
      i === index ? target : i === target ? index : i
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setIsSubmitting(true);

    let uploaded = 0;

    try {
      let nextContent = content;

      for (const [path, file] of Object.entries(pendingFiles)) {
        // Only ever pass through the backend-issued assetId — never construct
        // or guess an S3 URL on the frontend.
        const existingAssetId = readString(nextContent, path);
        const asset = existingAssetId
          ? await replaceAsset(existingAssetId, file)
          : await uploadAsset(file);

        uploaded += 1;
        nextContent = writePath(nextContent, path, asset.assetId);
      }

      // The response carries the stored document back, so no refetch is
      // needed — extra `slug`/`<field>Url`/`<field>Type` keys are stripped
      // again on the next save.
      adoptDoc(await saveSection(target, { content: nextContent, isPublished }));

      setSaved(true);
      // Keeps the server-rendered "Last updated" line in step.
      router.refresh();
    } catch (err) {
      const message = resolveErrorMessage(err);
      setError(
        uploaded > 0
          ? `${message} Some images uploaded but the section was not saved. Re-select any missing images and try again.`
          : message
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReset() {
    const confirmed = window.confirm(
      "Reset this section to its default content? Unsaved changes will be lost."
    );
    if (!confirmed) return;

    setError(null);
    setSaved(false);
    setIsSubmitting(true);

    try {
      await resetSection(target);
      adoptDoc(await reloadSection(target));
      router.refresh();
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-2xl flex-col gap-8">
      {fields.map((field) =>
        field.kind === "objectList" ? (
          <ObjectListField
            key={field.name}
            field={field}
            ctx={ctx}
            onAdd={() => handleAddItem(field)}
            onRemove={(index) => handleRemoveItem(field, index)}
            onMove={(index, direction) => handleMoveItem(field, index, direction)}
          />
        ) : (
          <ScalarFieldControl
            key={field.name}
            field={field}
            path={field.name}
            ctx={ctx}
          />
        )
      )}

      {showPublishToggle && (
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={isPublished}
            disabled={isSubmitting}
            onChange={(event) => {
              setSaved(false);
              setIsPublished(event.target.checked);
            }}
            className="h-4 w-4 rounded border-neutral-300"
          />
          Published
        </label>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-neutral-900 px-6 py-3 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save section"}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={isSubmitting}
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-900 disabled:opacity-50"
        >
          Reset to defaults
        </button>

        {saved && <span className="text-sm text-neutral-500">Saved</span>}
      </div>
    </form>
  );
}
