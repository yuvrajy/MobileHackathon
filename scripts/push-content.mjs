import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DIFFICULTIES, readContent } from "./content-files.mjs";

const contentDir = join(dirname(fileURLToPath(import.meta.url)), "..", "content");
const { challenges, punishments, errors } = readContent(contentDir);

if (errors.length) {
  console.error("Fix these before pushing:\n" + errors.map((e) => "  " + e).join("\n"));
  process.exit(1);
}

for (const d of DIFFICULTIES) console.log(`${d}: ${challenges.filter((c) => c.difficulty === d).length} challenges`);
console.log(`punishments: ${punishments.length}`);

const result = spawnSync(
  "npx",
  ["convex", "run", "content:importContent", JSON.stringify({ challenges, punishments }), ...process.argv.slice(2)],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
