import { XConstruct } from "@pdkit/core/src";

/**
 * A job step.
 */
export interface GithubJobStepProps {
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

export class GithubJobStep extends XConstruct {
  readonly props: GithubJobStepProps;

  constructor(scope: XConstruct, id: string, props?: GithubJobStepProps) {
    super(scope, id);

    this.props = props ?? {};
  }

  get content(): GithubJobStepProps & { id?: string } {
    return { ...this.props, id: this.node.id };
  }
}