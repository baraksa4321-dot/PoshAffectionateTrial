const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Accept only navigable external URLs. In particular, do not pass javascript:,
 * data:, or URLs with embedded credentials into href/src attributes.
 */
export function isSafeHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const candidate = value.trim();
  if (!candidate) return false;

  try {
    const url = new URL(candidate);
    return (
      HTTP_PROTOCOLS.has(url.protocol) &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

/**
 * Video fields also hold short-lived local previews and uploaded data URLs.
 * Keep those two browser-local schemes allowed, but never allow arbitrary
 * non-http schemes from persisted or user-entered data.
 */
export function isSafeVideoSource(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const candidate = value.trim();
  if (!candidate) return false;
  if (candidate.startsWith("blob:")) return true;
  if (/^data:video\/[a-z0-9.+-]+(?:;[^,]*)?,/i.test(candidate)) return true;
  return isSafeHttpUrl(candidate);
}