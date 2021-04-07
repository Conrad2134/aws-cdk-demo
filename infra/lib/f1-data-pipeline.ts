import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { GitHubTrigger, ManualApprovalAction } from '@aws-cdk/aws-codepipeline-actions';
import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { CdkPipeline, ShellScriptAction, SimpleSynthAction } from '@aws-cdk/pipelines';
import { F1DataStage } from './f1-data-stage';

/**
 * The stack that defines the application pipeline
 */
export class F1DataPipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, 'Pipeline', {
      // The pipeline name
      pipelineName: 'F1DataPipeline',
      cloudAssemblyArtifact,

      // Where the source can be found
      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: 'GitHub',
        output: sourceArtifact,
        oauthToken: SecretValue.secretsManager('github-token'),
        owner: 'Conrad2134',
        repo: 'aws-cdk-demo',
        branch: 'main',
        trigger: GitHubTrigger.POLL,
      }),

      // How it will be built and synthesized
      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        installCommand: 'npm i -g npm@latest && npm ci',
        buildCommand: 'cd .. && npm ci',
        synthCommand: 'cd infra && npx cdk synth',
        subdirectory: 'infra',
      }),
    });

    // This is where we add the application stages
    const devStage = new F1DataStage(this, 'Dev', {
      env: { account: '194237782353', region: 'us-east-1' },
      stage: 'dev',
    });

    const devAppStage = pipeline.addApplicationStage(devStage);

    devAppStage.addActions(
      new ShellScriptAction({
        actionName: 'IntegrationTests',
        commands: ['npm i -g npm@latest', 'cd infra', 'npm ci', 'npm run test:integration'],
        additionalArtifacts: [sourceArtifact],
        runOrder: devAppStage.nextSequentialRunOrder(),
        useOutputs: {
          SERVICE_URL: pipeline.stackOutput(devStage.url),
        },
      }),
      new ManualApprovalAction({ actionName: 'Promote', runOrder: devAppStage.nextSequentialRunOrder() })
    );

    const prodStage = pipeline.addApplicationStage(
      new F1DataStage(this, 'Prod', {
        env: { account: '194237782353', region: 'us-east-1' },
        stage: 'prod',
      })
    );
  }
}
