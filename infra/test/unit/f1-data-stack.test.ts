import { expect as expectCDK, haveOutput, haveResource, SynthUtils } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { F1DataStack } from '../../lib/f1-data-stack';

test('outputs', () => {
  const app = new cdk.App();
  const stack = new F1DataStack(app, 'F1DataTestStack', { stage: 'dev' });

  expectCDK(stack).to(haveOutput({ outputName: 'Stage', outputValue: 'dev' }));
  expect(stack.url).not.toBeFalsy();
});

test('snapshot', () => {
  const app = new cdk.App();
  const stack = new F1DataStack(app, 'F1DataTestStack', { stage: 'dev' });

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('key resources', () => {
  const app = new cdk.App();
  const stack = new F1DataStack(app, 'F1DataTestStack', { stage: 'dev' });

  // We have a lambda function
  expectCDK(stack).to(
    haveResource('AWS::Lambda::Function', {
      FunctionName: 'dev-get-drivers',
      Runtime: 'nodejs14.x',
    })
  );

  // We have an error alarm configured for that function
  expectCDK(stack).to(
    haveResource('AWS::CloudWatch::Alarm', {
      AlarmName: 'dev-get-drivers-error',
      MetricName: 'Errors',
      Statistic: 'Sum',
      Threshold: 1,
      Unit: 'Count',
    })
  );

  // Gateway and resource/method
  expectCDK(stack).to(haveResource('AWS::ApiGateway::RestApi'));

  expectCDK(stack).to(
    haveResource('AWS::ApiGateway::Resource', {
      PathPart: 'drivers',
      RestApiId: {
        Ref: 'devApiC3CC17DA',
      },
    })
  );

  expectCDK(stack).to(
    haveResource('AWS::ApiGateway::Method', {
      HttpMethod: 'GET',
      ResourceId: {
        Ref: 'devApidrivers15332EDF',
      },
    })
  );
});
