import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as fs from 'fs';

export interface LambdaProps {
  entry: string;
  name: string;
}

export class Lambda extends cdk.Construct {
  public readonly handler: lambda.IFunction;

  constructor(scope: cdk.Construct, id: string, props: LambdaProps) {
    super(scope, id);

    // Make sure we can access the file, throw if we cannot.
    try {
      fs.accessSync(props.entry, fs.constants.F_OK);
    } catch {
      throw new Error(`Unable to access file at ${props.entry}`);
    }

    this.handler = new lambdaNode.NodejsFunction(this, `${id}StandardLambda`, {
      entry: props.entry,
      handler: 'handler',
      functionName: props.name,
      runtime: lambda.Runtime.NODEJS_14_X,
    });

    this.handler
      .metricErrors({
        period: cdk.Duration.minutes(1),
        statistic: cloudwatch.Statistic.SUM,
        unit: cloudwatch.Unit.COUNT,
      })
      .createAlarm(this, `${id}ErrorAlarm`, {
        alarmName: `${props.name}-error`,
        alarmDescription: `Alarm for errors in ${props.name}`,
        evaluationPeriods: 1,
        threshold: 1,
      });
  }
}
