import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
// Read the poem exactly as stored, with no trimming or changes.
const text = readFileSync(join(here, "entry.txt"), "utf8");

// Guard the gate: the poem body must be 1 to 280 Unicode code points.
const poem = text.replace(/\n$/, "");
const codePoints = [...poem].length;
if (codePoints < 1 || codePoints > 280 || poem.trim().length === 0) {
  throw new Error(`Entry must be 1 to 280 code points, got ${codePoints}`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), text, "utf8");
console.log(`Wrote entry.txt (${codePoints} code points)`);
