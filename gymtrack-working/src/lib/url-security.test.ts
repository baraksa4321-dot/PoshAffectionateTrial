import { describe, expect, test } from "bun:test";
import { isSafeHttpUrl, isSafeVideoSource } from "./url-security";

describe("URL security", () => {
  test("accepts ordinary HTTP and HTTPS links without credentials", () => {
    expect(isSafeHttpUrl("https://example.com/video.mp4")).toBe(true);
    expect(isSafeHttpUrl(" http://example.com/product ")).toBe(true);
  });

  test("rejects executable schemes and credential-bearing URLs", () => {
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeHttpUrl("https://user:pass@example.com/video.mp4")).toBe(false);
    expect(isSafeHttpUrl("/relative/path")).toBe(false);
  });

  test("allows local video previews but not arbitrary data URLs", () => {
    expect(isSafeVideoSource("blob:https://example.com/preview")).toBe(true);
    expect(isSafeVideoSource("data:video/mp4;base64,AAAA")).toBe(true);
    expect(isSafeVideoSource("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeVideoSource("javascript:alert(1)")).toBe(false);
  });
});