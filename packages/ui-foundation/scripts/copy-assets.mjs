import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const copies = [
  ["styles/base.css", "dist/styles/base.css"],
  ["styles/tailwind-v4.css", "dist/styles/tailwind-v4.css"],
  ["tailwind.preset.cjs", "dist/tailwind.preset.cjs"],
];

for (const [from, to] of copies) {
  const source = join(packageRoot, from);
  const target = join(packageRoot, to);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}
