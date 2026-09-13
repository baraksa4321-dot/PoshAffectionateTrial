import { useCallback, useEffect, useState, type SetStateAction } from "react";

const PREFIX = "gymtrack.form-draft.v2.";

function storageKey(key: string, scope = "guest") {
  const safeScope = scope.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80) || "guest";
  return `${PREFIX}${safeScope}.${key}`;
}

function readStored<T>(key: string, fallback: T, scope: string): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(key, scope));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { value?: T };
    return "value" in parsed ? (parsed.value as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored<T>(key: string, value: T, scope: string) {
  if (typeof window === "undefined") return;
  try {
    if (value === undefined || value === null || value === "") {
      window.localStorage.removeItem(storageKey(key, scope));
      return;
    }
    window.localStorage.setItem(storageKey(key, scope), JSON.stringify({ value }));
  } catch {
    // Private browsing and quota failures must not block typing.
  }
}

export function usePersistentDraft<T>(key: string, fallback: T, scope = "guest") {
  const [value, setValue] = useState<T>(() => readStored(key, fallback, scope));
  const setPersistentValue = useCallback(
    (next: SetStateAction<T>) => {
      setValue((current) => {
        const resolved = typeof next === "function" ? (next as (previous: T) => T)(current) : next;
        writeStored(key, resolved, scope);
        return resolved;
      });
    },
    [key, scope],
  );
  return [value, setPersistentValue] as const;
}

function isDraftField(element: Element): element is HTMLInputElement | HTMLTextAreaElement {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    return false;
  }
  if (
    element.disabled ||
    element.readOnly ||
    element.dataset["noDraft"] === "true" ||
    element.type === "password" ||
    element.type === "hidden" ||
    element.type === "file" ||
    element.type === "search"
  ) {
    return false;
  }
  return Boolean(element.id || element.name || element.dataset["draftKey"]);
}

function fieldDraftKey(field: HTMLInputElement | HTMLTextAreaElement, scope: string) {
  const owner =
    field.form?.id ||
    field.form?.dataset["testid"] ||
    field.closest<HTMLElement>("[data-draft-scope]")?.dataset["draftScope"] ||
    window.location.pathname;
  const identity =
    field.dataset["draftKey"] ||
    field.id ||
    field.name ||
    field.getAttribute("aria-label") ||
    "field";
  return `${owner}.${identity}`;
}

function persistField(field: HTMLInputElement | HTMLTextAreaElement, scope: string) {
  const key = storageKey(fieldDraftKey(field, scope), scope);
  try {
    if (field.value === "") {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify({ value: field.value }));
    }
  } catch {
    // Draft persistence is best effort and must never interrupt input.
  }
}

function restoreField(field: HTMLInputElement | HTMLTextAreaElement, scope: string) {
  if (!isDraftField(field) || field.value !== "") return;
  try {
    const raw = window.localStorage.getItem(storageKey(fieldDraftKey(field, scope), scope));
    if (!raw) return;
    const stored = JSON.parse(raw) as { value?: unknown };
    if (typeof stored.value !== "string" || stored.value === "") return;
    const prototype =
      field instanceof HTMLInputElement
        ? HTMLInputElement.prototype
        : HTMLTextAreaElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    setter?.call(field, stored.value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  } catch {
    // Ignore malformed or unavailable drafts.
  }
}

function restoreDraftFields(scope: string, root: ParentNode = document) {
  root.querySelectorAll("input, textarea").forEach((element) => {
    if (isDraftField(element)) restoreField(element, scope);
  });
}

/**
 * Keeps non-sensitive text drafts while a user navigates, backgrounds, or
 * reopens the app. Emptying a field explicitly removes its draft.
 */
export function usePersistentFormDrafts(scope = "guest") {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let restoreTimer: number | null = null;
    const restore = () => {
      if (restoreTimer !== null) window.clearTimeout(restoreTimer);
      restoreTimer = window.setTimeout(() => {
        restoreTimer = null;
        restoreDraftFields(scope);
      }, 0);
    };
    const onInput = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        if (isDraftField(target)) persistField(target, scope);
      }
    };
    const onPageHide = () => {
      document.querySelectorAll("input, textarea").forEach((element) => {
        if (isDraftField(element)) persistField(element, scope);
      });
    };
    const observer = new MutationObserver(restore);
    document.addEventListener("input", onInput, true);
    window.addEventListener("pageshow", restore);
    window.addEventListener("focus", restore);
    window.addEventListener("pagehide", onPageHide);
    observer.observe(document.body, { childList: true, subtree: true });
    restore();
    return () => {
      if (restoreTimer !== null) window.clearTimeout(restoreTimer);
      document.removeEventListener("input", onInput, true);
      window.removeEventListener("pageshow", restore);
      window.removeEventListener("focus", restore);
      window.removeEventListener("pagehide", onPageHide);
      observer.disconnect();
    };
  }, [scope]);
}
