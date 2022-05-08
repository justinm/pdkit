import { Construct } from "constructs";
import { GitIgnore } from "../../L2";

export class AmplifySupport extends Construct {
  constructor(scope: Construct) {
    super(scope, "AmplifySupport");

    new GitIgnore(this, "AmplifyIgnore", [
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
