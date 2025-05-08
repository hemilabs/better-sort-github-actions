"use strict";

const {
  Document,
  Pair, // eslint-disable-line no-unused-vars
  parseDocument,
  stringify,
  YAMLMap,
  YAMLSeq,
} = require("yaml");

const keys = require("./keys.json");

/**
 * @param {Document} doc
 * @param {string} key
 */
const findPairByKey = (doc, key) =>
  /** @type {YAMLMap}*/ (doc.contents).items.find(
    (item) => item.key.value === key,
  );

/**
 * @param {string} level
 */
const doNotSortKeys = (level) => level.endsWith("!");

/**
 * @param {string} level
 */
const sortValuesAsCurrentLevel = (level) => level.endsWith("*");

/**
 * @param {string} level
 */
const removePostFix = (level) =>
  doNotSortKeys(level) || sortValuesAsCurrentLevel(level)
    ? level.slice(0, -1)
    : level;

/**
 * @param {YAMLMap|YAMLSeq|unknown} node
 * @param {"composite"|"workflow"} type
 * @param {string} level
 */
function sortNode(node, type, level) {
  if (node instanceof YAMLMap) {
    const tempDoc = new Document(node);
    // eslint-disable-next-line no-use-before-define
    const sortedDoc = sortKeys(tempDoc, type, level);
    return sortedDoc.contents;
  }

  if (node instanceof YAMLSeq) {
    const tempSeq = new YAMLSeq();
    node.items.forEach(function (item) {
      const sortedItem = sortNode(item, type, removePostFix(level));
      tempSeq.add(sortedItem);
    });
    return tempSeq;
  }

  return node;
}

/**
 * @param {Document} doc
 * @param {"composite"|"workflow"} [type]
 * @param {string} [level]
 * @returns
 */
function sortKeys(doc, type = "workflow", level = "root") {
  const contents = /** @type {YAMLMap}*/ (doc.contents);

  if (doNotSortKeys(level)) {
    const currentLevel = removePostFix(level);
    contents.items.forEach(function (pair) {
      const sortedValue = sortNode(pair.value, type, currentLevel);
      pair.value = sortedValue;
    });
    return doc;
  }

  if (sortValuesAsCurrentLevel(level)) {
    const currentLevel = removePostFix(level);
    const sortedMap = new YAMLMap();
    const sortedKeys = contents.items.map((item) => item.key.value).sort();
    sortedKeys.forEach(function (key) {
      const pair = /** @type {Pair} */ (findPairByKey(doc, key));
      const sortedValue = sortNode(pair.value, type, currentLevel);
      sortedMap.add({ key: pair.key, value: sortedValue });
    });
    doc.contents = sortedMap;
    return doc;
  }

  const sortedMap = new YAMLMap();
  const keyOrder = keys[type]?.[level] || [];
  keyOrder.forEach(function (key) {
    const currentKey = removePostFix(key);
    const pair = findPairByKey(doc, currentKey);
    if (pair) {
      const sortedValue = sortNode(pair.value, type, key);
      sortedMap.add({ key: pair.key, value: sortedValue });
    }
  });
  const sortedKeys = contents.items.map((item) => item.key.value).sort();
  sortedKeys.forEach(function (key) {
    const isAlreadyInSortedMap = sortedMap.items.some(
      (item) => /** @type {Pair} */ (item).key.value === key,
    );
    if (!isAlreadyInSortedMap) {
      const pair = /** @type {Pair} */ (findPairByKey(doc, key));
      const sortedValue = sortNode(pair.value, type, key);
      sortedMap.add({ key: pair.key, value: sortedValue });
    }
  });

  doc.contents = sortedMap;
  return doc;
}

/**
 * @param {string} source
 */
function sort(source) {
  const doc = parseDocument(source);
  if (!(doc.contents instanceof YAMLMap)) {
    return source;
  }

  let sortedDoc;
  if (findPairByKey(doc, "runs")) {
    sortedDoc = sortKeys(doc, "composite", "root");
  } else if (findPairByKey(doc, "jobs")) {
    sortedDoc = sortKeys(doc, "workflow", "root");
  } else {
    // Doesn't seem to be a workflow or composite action
    sortedDoc = doc;
  }

  return stringify(sortedDoc, { keepSourceTokens: true, lineWidth: -1 });
}

module.exports = {
  sort,
};
