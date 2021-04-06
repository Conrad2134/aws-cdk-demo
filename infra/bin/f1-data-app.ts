#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { F1DataStack } from '../lib/f1-data-stack';
import { F1DataPipeline } from '../lib/f1-data-pipeline';

const app = new cdk.App();

new F1DataPipeline(app, 'F1DataPipeline', {
  env: { region: 'us-east-1', account: '194237782353' },
});

// We don't need this here, but it helps for local testing (synthing the stack).
new F1DataStack(app, 'dev', {
  env: {
    region: 'us-east-1',
    account: '194237782353',
  },
  stage: 'dev',
});

app.synth();
