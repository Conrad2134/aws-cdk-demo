import { expect as expectCDK, haveResource, SynthUtils } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { Lambda } from '../../lib/lambda';
import * as path from 'path';

test('lambda is created with an alarm', () => {
  const stack = new cdk.Stack();

  new Lambda(stack, 'TestFunction', {
    name: 'test-function',
    entry: path.join(__dirname, 'utils', 'sample.ts'),
  });

  expectCDK(stack).to(haveResource('AWS::Lambda::Function'));
  expectCDK(stack).to(haveResource('AWS::CloudWatch::Alarm'));
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('error is thrown when an invalid entry path is supplied', () => {
  const stack = new cdk.Stack();

  expect(() => {
    new Lambda(stack, 'TestFunction', {
      name: 'test-function',
      entry: '../../hello.txt',
    });
  }).toThrowError('Unable to access file at ../../hello.txt');
});
