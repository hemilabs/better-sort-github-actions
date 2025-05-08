# better-sort-github-actions-files

Sorts GitHub Actions workflow or composite action files following these rules:

1. The known properties are sorted following the order in the [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions) or [Metadata syntax for GitHub Actions](https://docs.github.com/en/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions).
1. All other properties are sorted in alphabetical order.

## Motivation and prior art

Having a consistent properties order in the files helps with the readability and maintainability but following the exact order of the docs can be tricky when done manually. We resolved the same problem in the past for [package.json](https://github.com/hemilabs/better-sort-package-json) files and now was the turn of these YAML files.

## CLI

This package can be installed globally, then used to sort GitHub Actions files:

```sh
npm install --global better-sort-github-actions
better-sort-github-actions <path-to-a-github-actions-file-to-sort>
```

In addition, it can be used without installing it:

```sh
npx better-sort-github-actions <path-to-a-github-actions-file-to-sort>
```

## API

Install the package:

```sh
npm install better-sort-github-actions
```

Then use it to sort the contents of a YAML file:

```js
const fs = require("node:fs");
const { sort } = require("better-sort-github-actions");

fs.writeFileSync(path, sort(fs.readFileSync(path, "utf8")));
```

## Automatically sort on commit

To let [`lint-staged`](https://github.com/lint-staged/lint-staged) take care of sorting the GitHub Actions files automatically use:

```json
{
  ".github/workflows/*.yml": ["better-sort-github-actions"]
}
```
