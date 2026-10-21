import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createDemoSessions } from "../src/data/demoSessions";
import { summariseSessions, toCsv } from "../src/lib/metrics";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(root, "public", "demo");
mkdirSync(outputDir, { recursive: true });

const sessions = createDemoSessions(24);
const summary = summariseSessions(sessions);

writeFileSync(resolve(outputDir, "sessions.json"), JSON.stringify(sessions, null, 2));
writeFileSync(resolve(outputDir, "analysis-summary.json"), JSON.stringify(summary, null, 2));
writeFileSync(resolve(outputDir, "sessions.csv"), `${toCsv(sessions)}\n`);

console.log("Wrote SYNTHETIC DEMO sessions to public/demo/");
console.log(`Sessions: ${summary.n}`);
console.log(`Completion: ${(summary.completionRate * 100).toFixed(1)}%`);
console.log(`SUS: ${summary.sus.mean.toFixed(1)} (SD ${summary.sus.sd.toFixed(1)})`);
console.log(`UMUX-Lite: ${summary.umux.mean.toFixed(1)}`);
console.log("Not real participant data. Do not cite as a usability finding.");
