#!/usr/bin/env ts-node

import spdxFull from 'spdx-license-list/full';

/**
 * Helper CLI to generate the list of type unions for the License.ts file
 *
 * Usage: packages/@pdkit/core/util/CodeGenValidLicense.ts
 *
 * @see packages/@pdkit/core/L2/constructs/License.ts
*/

for (const name of Object.keys(spdxFull).sort()) {
  process.stdout.write(`  | "${name}"\n`)
}