#!/usr/bin/env -S node

// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

// eslint-disable-next-line @typescript-eslint/no-require-imports
require("ts-node").register({ project: path.join(__dirname, "tsconfig.json") });

// eslint-disable-next-line @typescript-eslint/no-require-imports
require(path.join(__dirname, "./stackgen.ts"));
