import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { THEME_PALETTES } from "../src/lib/theme";

const projectRoot = join(import.meta.dir, "..");
const stylesPath = join(projectRoot, "src/styles.css");

const statusGroups = {
  success: {
    families: ["emerald", "green", "teal", "lime"],
    variables: ["--status-success", "--status-success-soft", "--status-success-border"],
  },
  warning: {
    families: ["amber", "yellow", "orange"],
    variables: ["--status-warning", "--status-warning-soft", "--status-warning-border"],
  },
  info: {
    families: ["blue", "sky", "cyan", "indigo", "purple", "violet"],
    variables: ["--status-info", "--status-info-soft", "--status-info-border"],
  },
  danger: {
    families: ["rose", "red", "pink"],
    variables: ["--status-danger", "--status-danger-soft", "--status-danger-border"],
  },
} as const;

type StatusGroup = keyof typeof statusGroups;
type StatusProperty = "bg" | "text" | "border" | "ring";

const neutralFamilies = new Set([
  "black",
  "white",
  "gray",
  "slate",
  "zinc",
  "neutral",
  "stone",
  "current",
  "transparent",
]);
const colorFamilies = [
  ...Object.values(statusGroups).flatMap((definition) => definition.families),
  ...neutralFamilies,
  "fuchsia",
];
const statusFamilyToGroup = new Map<string, StatusGroup>(
  Object.entries(statusGroups).flatMap(([group, definition]) =>
    definition.families.map((family) => [family, group as StatusGroup]),
  ),
);
const utilityPattern =
  new RegExp(
    "(?:^|[\\s\"'\\x60])(?:[a-z-]+:)*(bg|text|border|ring)-(" +
      colorFamilies.join("|") +
      ")-(\\d+)(?:\\/\\d+)?(?=$|[\\s\"'\\x60])",
    "g",
  );

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

function fail(messages: string[]): never {
  console.error("Status-color contract failed:");
  for (const message of messages) console.error(`- ${message}`);
  process.exit(1);
}

const css = readFileSync(stylesPath, "utf8");
const sourceFiles = collectSourceFiles(join(projectRoot, "src"));
const violations: string[] = [];
const usedStatusUtilities = new Set<string>();

for (const filePath of sourceFiles) {
  const source = readFileSync(filePath, "utf8");
  for (const match of source.matchAll(utilityPattern)) {
    const [, property, family, shade] = match;
    const group = statusFamilyToGroup.get(family);
    if (!group) {
      if (!neutralFamilies.has(family)) {
        violations.push(
          `${relative(projectRoot, filePath)} uses unmapped ${property}-${family}-${shade} utility`,
        );
      }
      continue;
    }

    const utility = `${property}-${family}-`;
    usedStatusUtilities.add(utility);
    if (!css.includes(`[class*="${utility}"]`)) {
      violations.push(
        `${relative(projectRoot, filePath)} uses ${property}-${family}-${shade}, but ${group} has no palette selector`,
      );
    }
  }
}

for (const [group, definition] of Object.entries(statusGroups) as [
  StatusGroup,
  (typeof statusGroups)[StatusGroup],
][]) {
  for (const variable of definition.variables) {
    if (!css.includes(`${variable}:`)) {
      violations.push(`${group} is missing ${variable}`);
    }
  }

  for (const property of ["bg", "text", "border", "ring"] as StatusProperty[]) {
    const selector = `[class*="${property}-${definition.families[0]}-"]`;
    if (!css.includes(selector)) {
      violations.push(`${group} is missing the ${property} palette selector`);
    }
  }
}

for (const palette of THEME_PALETTES) {
  const paletteSelector = `:root[data-theme="${palette.id}"]`;
  const paletteStartPattern = new RegExp(
    `^${paletteSelector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{`,
    "gm",
  );
  let paletteBlock = "";
  for (const paletteStartMatch of css.matchAll(paletteStartPattern)) {
    const nextBlock = css.indexOf("\n:root", paletteStartMatch.index + paletteStartMatch[0].length);
    const candidate = css.slice(
      paletteStartMatch.index,
      nextBlock === -1 ? undefined : nextBlock,
    );
    if (candidate.includes("--primary:")) {
      paletteBlock = candidate;
      break;
    }
  }
  if (!paletteBlock) {
    violations.push(`palette ${palette.id} has no CSS variable block`);
    continue;
  }
  for (const variable of ["--primary:", "--accent:", "--rose:"]) {
    if (!paletteBlock.includes(variable)) {
      violations.push(`palette ${palette.id} is missing ${variable.slice(0, -1)}`);
    }
  }
}

const requiredCssContracts = [
  ":root[data-theme] {",
  ":root:not(.night-mode)",
  ":root.night-mode[data-theme]",
  "--background: #303034",
  "--ink: #f4f1f2",
  "--border: #48484d",
  "--ring: var(--primary)",
];
for (const contract of requiredCssContracts) {
  if (!css.includes(contract)) violations.push(`missing day/night contract: ${contract}`);
}

if (violations.length > 0) fail(violations);

console.log(
  `PASS: ${THEME_PALETTES.length} palettes, day/night variables, and ${usedStatusUtilities.size} status utility families are palette-resolved.`,
);