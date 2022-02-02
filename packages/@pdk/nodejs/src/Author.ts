import { Construct } from "constructs";
import { XManifestEntry } from "../../core/src/constructs/XManifestEntry";

export interface AuthorProps {
  readonly name?: string;
  readonly email?: string;
  readonly organization?: boolean;
  readonly url?: string;
}

export class Author extends XManifestEntry {
  constructor(scope: Construct, id: string, props: AuthorProps) {
    super(scope, id);

    this.addFields({
      author: {
        name: props.name,
        email: props.email,
        url: props.url,
        organization: props.organization,
      },
    });
  }
}
