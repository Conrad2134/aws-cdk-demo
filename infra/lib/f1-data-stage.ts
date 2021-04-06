import { CfnOutput, Construct, Stage, StageProps } from '@aws-cdk/core';
import { F1DataStack } from './f1-data-stack';

interface F1DataStageProps extends StageProps {
  stage: 'dev' | 'prod';
}

/**
 * Deployable unit of web service app
 */
export class F1DataStage extends Stage {
  public readonly url: CfnOutput;

  constructor(scope: Construct, id: string, props: F1DataStageProps) {
    super(scope, id, props);

    const service = new F1DataStack(this, 'F1DataStack', { stage: props.stage });

    // Expose F1DataStack's output one level higher
    this.url = service.url;
  }
}
