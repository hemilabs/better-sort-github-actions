#!/usr/bin/env node

"use strict";

const { readFileSync, writeFileSync } = require("node:fs");

const { sort } = require("..");

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Usage: better-sort-github-actions <file> [<file>...]");
  process.exit(1);
}

// TODO check how globs are handled

try {
  files.forEach(function (file) {
    writeFileSync(file, sort(readFileSync(file, "utf8")));
  });
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
