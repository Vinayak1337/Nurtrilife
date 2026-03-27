#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const rootDirectory = process.cwd();
const shouldDryRun = process.argv.includes("--dry-run");
const ignoredDirectories = new Set([
  ".git",
  "node_modules",
]);

async function collectMacOsFiles(directoryPath, matches) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }

      await collectMacOsFiles(fullPath, matches);
      continue;
    }

    if (entry.isFile() && entry.name.startsWith("._")) {
      matches.push(fullPath);
    }
  }
}

async function main() {
  const matches = [];
  await collectMacOsFiles(rootDirectory, matches);

  if (matches.length === 0) {
    console.log("No files starting with '._' were found.");
    return;
  }

  if (shouldDryRun) {
    console.log(`Found ${matches.length} file(s):`);

    for (const filePath of matches) {
      console.log(path.relative(rootDirectory, filePath));
    }

    return;
  }

  await Promise.all(matches.map((filePath) => fs.unlink(filePath)));

  console.log(`Deleted ${matches.length} file(s):`);
  for (const filePath of matches) {
    console.log(path.relative(rootDirectory, filePath));
  }
}

try {
  await main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to remove macOS metadata files: ${message}`);
  process.exitCode = 1;
}
