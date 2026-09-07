import { existsSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(new URL("..", import.meta.url).pathname);
const result = spawnSync("vite", ["build", "--config", "vite.mobile.config.ts"], {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const mobileOutput = resolve(projectRoot, "dist-mobile");
const generatedEntry = resolve(mobileOutput, "index.mobile.html");
const capacitorEntry = resolve(mobileOutput, "index.html");

if (!existsSync(generatedEntry)) {
  throw new Error(`Mobile build did not produce ${generatedEntry}`);
}

renameSync(generatedEntry, capacitorEntry);