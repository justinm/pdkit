# Overwriting package.json fields

Since StackGen uses multiple merge strategies, you can merge and/or override generated fields as needed using the
ManifestEntry construct. For example

```typescript
import { ManifestEntry } from "@stackgen/core";

// Overwrite the automated compile script
new ManifestEntry(project, "CustomOverride", {
  scripts: {
    compile: "./compile.sh",
  },
});

// Override the entire scripts key
new ManifestEntry(
  project,
  "CustomOverride",
  {
    scripts: {
      build: "my_custom_build_command",
    },
  },
  { shallow: true }
);

// Erase a key
new ManifestEntry(project, "CustomOverride", {
  scripts: {
    build: undefined,
  },
});
```
