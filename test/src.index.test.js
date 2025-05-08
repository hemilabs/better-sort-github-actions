"use strict";

const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const assert = require("node:assert").strict;

const { sort } = require("..");

test("sort a workflow file", function () {
  const input = readFileSync("test/fixtures/workflow.yml", "utf8");
  const output = readFileSync("test/fixtures/workflow-sorted.yml", "utf8");
  assert.equal(sort(input), output);
});

test("sort a composite action file", function () {
  const input = readFileSync("test/fixtures/action.yml", "utf8");
  const output = readFileSync("test/fixtures/action-sorted.yml", "utf8");
  assert.equal(sort(input), output);
});

test("do not sort other files", function () {
  const file = readFileSync("test/fixtures/other.yml", "utf8");
  assert.equal(sort(file), file);
});
