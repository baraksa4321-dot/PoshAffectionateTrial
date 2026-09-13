import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));

describe("offline loading assets", () => {
  test("ships a local image fallback for every animated loading illustration", () => {
    const rootRoute = readFileSync(resolve(projectRoot, "src/routes/__root.tsx"), "utf8");
    const serviceWorker = readFileSync(resolve(projectRoot, "public/sw.js"), "utf8");
    const illustrations = [
      "user-strawberry.png",
      "user-tomato.png",
      "user-character-01.png",
      "user-character-02.png",
      "user-character-03.png",
      "user-character-04.png",
      "user-character-05.png",
      "user-character-06.png",
      "user-character-07.png",
      "user-character-08.png",
      "user-character-09.png",
      "user-character-10.png",
      "user-lemon.png",
    ];

    expect(rootRoute).toContain("SIMPLE_LOADING_ILLUSTRATIONS");
    expect(rootRoute).toContain("isAnimatedLoadingUser");
    expect(rootRoute).toContain("loading-simple-fallback");
    expect(rootRoute).toContain("loading-simple-video");
    expect(rootRoute).toContain("/loading/tinted/${animationFile}");
    expect(serviceWorker).toContain("./loading/user-strawberry.png");
    expect(
      illustrations.every((file) => existsSync(resolve(projectRoot, "public/loading", file))),
    ).toBe(true);
    expect(
      illustrations
        .map((file) => file.replace(".png", ".mp4"))
        .every((file) => existsSync(resolve(projectRoot, "public/loading/tinted", file))),
    ).toBe(true);
  });
});