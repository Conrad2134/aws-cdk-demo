import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as path from 'path';
import { Lambda } from './lambda';

interface F1ServiceStackProps extends cdk.StackProps {
  stage: 'dev' | 'prod';
}

export class F1DataStack extends cdk.Stack {
  public readonly url: cdk.CfnOutput;
  public readonly stage: cdk.CfnOutput;

  constructor(scope: cdk.Construct, id: string, props: F1ServiceStackProps) {
    super(scope, id, props);

    const getDrivers = new Lambda(this, `${props.stage}-GetDrivers`, {
      name: `${props.stage}-get-drivers`,
      entry: path.join(__dirname, '..', '..', 'src', 'lambda', 'get-drivers.ts'),
    });

    const api = new apigw.RestApi(this, `${props.stage}-Api`);
    api.root.addResource('drivers').addMethod('GET', new apigw.LambdaIntegration(getDrivers.handler));

    this.stage = new cdk.CfnOutput(this, 'Stage', { value: props.stage });
    this.url = new cdk.CfnOutput(this, 'Url', {
      value: api.url,
    });
  }
}
