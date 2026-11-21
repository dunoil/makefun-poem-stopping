// Hand-in program for the poem about stopping: check the poem in
// entry.txt against the gate, publish an exact copy, prove it faithful.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const MAX_CODE_POINTS = 280;
const FALLBACK_OUTPUT_DIR = "/output";
const ENTRY_FILE_NAME = "entry.txt";
// Every failure goes through here so it reads clearly and stops the run.
function fail(message: string): never {
  throw new Error(`poem hand-in failed: ${message}`);
}
// The source poem lives beside this program, wherever it is checked out.
function sourcePath(): string {
  return join(dirname(fileURLToPath(import.meta.url)), ENTRY_FILE_NAME);
}
// Local runs point MAKEFUN_OUTPUT_DIR at a scratch folder; the grader
// leaves it unset, in which case the sandbox output mount is used.
function targetPath(): string {
  const configured = process.env.MAKEFUN_OUTPUT_DIR;
  const outputDir = configured ? resolve(configured) : FALLBACK_OUTPUT_DIR;
  return join(outputDir, ENTRY_FILE_NAME);
}
async function loadPoem(path: string): Promise<string> {
  try {
    return await readFile(path, "utf8");
  } catch {
    fail(`could not read the poem file at ${path}: check that entry.txt sits beside main.ts`);
  }
}
// Length means Unicode code points: Array.from walks the string by code
// point, so an astral character counts once, unlike String.length units.
function checkGate(poem: string): number {
  const count = Array.from(poem).length;
  if (count === 0) fail("the poem is empty, so there is nothing to hand in");
  if (poem.trim().length === 0) fail("the poem holds only whitespace, which the gate rejects");
  if (count > MAX_CODE_POINTS) {
    fail(`the poem runs to ${count} code points, over the ${MAX_CODE_POINTS} limit`);
  }
  return count;
}
async function publish(poem: string, destination: string): Promise<void> {
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, poem, "utf8");
  // Read the copy back: a short or altered write must fail loudly here.
  const written = await readFile(destination);
  if (!written.equals(Buffer.from(poem, "utf8"))) {
    fail(`verification failed: the copy in ${destination} differs from the source poem`);
  }
}
async function main(): Promise<void> {
  const poem = await loadPoem(sourcePath());
  const count = checkGate(poem);
  const destination = targetPath();
  await publish(poem, destination);
  console.log(`Handed in entry.txt: ${count} code points, verified copy at ${destination}`);
}
await main();
