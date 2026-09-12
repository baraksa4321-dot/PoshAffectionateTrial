import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));

describe("offline loading assets", () => {
  test("uses full-canvas animations for the loading illustration", () => {
    const rootRoute = readFileSync(resolve(projectRoot, "src/routes/__root.tsx"), "utf8");
    const serviceWorker = readFileSync(resolve(projectRoot, "public/sw.js"), "utf8");
    const illustrations = [
      "user-strawberry.gif",
      "user-tomato.gif",
      "user-character-01.gif",
      "user-character-02.gif",
      "user-lemon.gif",
      "user-character-03.gif",
      "user-character-04.gif",
      "user-character-05.gif",
      "user-character-06.gif",
      "user-character-07.gif",
      "user-character-08.gif",
      "user-character-09.gif",
      "user-character-10.gif",
    ];

    expect(rootRoute).toContain("SIMPLE_LOADING_ILLUSTRATIONS");
    expect(rootRoute).toContain("SIMPLE_LOADING_ILLUSTRATIONS.length");
    expect(rootRoute).toContain("loading-simple-animation");
    expect(rootRoute).toContain("/loading/clean/${animationFile}");
    expect(serviceWorker).toContain("./loading/clean/user-strawberry.gif");
    expect(illustrations.every((file) => existsSync(resolve(projectRoot, "public/loading/clean", file)))).toBe(true);
  });
});