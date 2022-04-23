import { GitIgnore, XConstruct } from "../core";

export class AmplifySupport extends XConstruct {
  constructor(scope: XConstruct) {
    super(scope, "AmplifySupport");

    new GitIgnore(this, [
      "amplify/#current-cloud-backend",
      "amplify/.config/local-*",
      "amplify/logs",
      "amplify/mock-data",
      "amplify/backend/amplify-meta.json",
      "amplify/backend/.temp",
      "build/",
      "dist/",
      "aws-exports.js",
      "awsconfiguration.json",
      "amplifyconfiguration.json",
      "amplifyconfiguration.dart",
      "amplify-build-config.json",
      "amplify-gradle-config.json",
      "amplifytools.xcconfig",
      ".secret-*",
      "**.sample",
    ]);
  }
}
