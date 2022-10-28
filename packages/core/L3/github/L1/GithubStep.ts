import { Construct } from "constructs";

/**
 * A job step.
 */
export interface GithubJobStepProps {
  /**
   * A jobs priority dictates which order its run in
   */
  readonly priority?: number;

  /**
   * You can use the if conditional to prevent a job from running unless a
   * condition is met. You can use any supported context and expression to
   * create a conditional.
   */
  readonly if?: string;

  /**
   * A name for your step to display on GitHub.
   */
  readonly name?: string;

  /**
   * Selects an action to run as part of a step in your job. An action is a
   * reusable unit of code. You can use an action defined in the same
   * repository as the workflow, a public repository, or in a published Docker
   * container image.
   */
  readonly uses?: string;

  readonly needs?: string;

  /**
   * Runs command-line programs using the operating system's shell. If you do
   * not provide a name, the step name will default to the text specified in
   * the run command.
   */
  readonly run?: string;

  /**
   * A map of the input parameters defined by the action. Each input parameter
   * is a key/value pair. Input parameters are set as environment variables.
   * The variable is prefixed with INPUT_ and converted to upper case.
   */
  readonly with?: Record<string, any>;

  /**
   * Sets environment variables for steps to use in the runner environment.
   * You can also set environment variables for the entire workflow or a job.
   */
  readonly env?: Record<string, string>;

  /**
   * Prevents a job from failing when a step fails. Set to true to allow a job
   * to pass when this step fails.
   */
  readonly continueOnError?: boolean;

  /**
   * The maximum number of minutes to run the step before killing the process.
   */
  readonly timeoutMinutes?: number;
}

export class GithubStep extends Construct {
  protected _fields: GithubJobStepProps;
  public readonly priority: number;

  constructor(scope: Construct, id: string, props?: GithubJobStepProps) {
    super(scope, id);

    this._fields = props ?? {};
    this.priority = props?.priority ?? 10;
  }

  /**
   * Deep merge new fields into the constructing JsonFile. Existing fields may be overwritten by this call.
   *
   * @param fields
   */
  public setFields(fields: GithubJobStepProps) {
    this._fields = fields;
  }

  get fields() {
    return this._fields;
  }

  get content(): GithubJobStepProps & { id?: string } {
    return { ...this._fields, id: this.node.id, priority: undefined };
  }
}
