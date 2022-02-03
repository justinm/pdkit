import { XManifestEntry } from "./XManifestEntry";

/**
 * An inheritable manifest entry is propagated to all children nested under the project containing
 * the entry.
 *
 * Use Case:
 *   Defining an Author at a workspace level should propagate the properties to all nested projects.
 */
export class XInheritableManifestEntry extends XManifestEntry {}
