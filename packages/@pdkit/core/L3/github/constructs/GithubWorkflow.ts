import { Construct } from "constructs";
import { Fields, LifeCycle, LifeCycleStage, YamlFile } from "../../../L1";
import { snakeCaseKeys } from "../../../util/Casing";
import { GithubEventProps } from "./GithubEvent";
import { GithubJob, GithubJobProps } from "./GithubJob";

// @see https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions
export interface GithubWorkflowProps {
  /**
   * Concurrency ensures that only a single job or workflow using the same concurrency group will run at a time.
   *
   * @default disabled
   * @experimental
   */
  readonly concurrency?: unknown;

  /**
   * Sets environment variables for steps to use in the runner environment.
   * You can also set environment variables for the entire workflow or a job.
   */
  readonly env?: Record<string, string>;

  /**
   * A list of Github Job definitions. Additional jobs may be added via the GithubJob construct.
   */
  readonly jobs?: Record<string, GithubJobProps>;

  /**
   * A list of Github Job definitions. Additional jobs may be added via the GithubJob construct.
   */
  readonly events?: GithubEventProps;
}

export class GithubWorkflow extends YamlFile {
  public static of(construct: Construct): GithubWorkflow {
    const workflow = construct.node.scopes.find((s) => s instanceof this) as GithubWorkflow;

    if (!workflow) {
      throw new Error(`${construct}: Not a child of a GithubWorkflow`);
    }

    return workflow;
  }

  readonly props: GithubWorkflowProps;

  constructor(scope: Construct, id: string, props: GithubWorkflowProps) {
    super(scope, id, { filePath: `.github/workflows/${id}.yml`, fields: {} });

    this.props = props;

    if (props && props.jobs) {
      const jobs = props.jobs;

      Object.keys(jobs).forEach((key) => new GithubJob(this, key, jobs[key]));
    }

    LifeCycle.implement(this);
    LifeCycle.of(this).on(LifeCycleStage.BEFORE_SYNTH, () => {
      const jobs = this.node
        .findAll()
        .filter((b) => b instanceof GithubJob)
        .reduce((coll, job) => {
          const ghj = job as GithubJob;

          coll[ghj.node.id] = ghj.content;

          return coll;
        }, {} as Record<string, unknown>);

      Fields.of(this).addShallowFields({
        env: this.props.env,
        on: snakeCaseKeys(this.props.events),
        concurrency: this.props.concurrency ?? "1",
        jobs,
      });
    });
  }
}
