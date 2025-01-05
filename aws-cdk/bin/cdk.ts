#!/usr/bin/env node
import 'dotenv/config'; // Load environment variables from .env file
import * as cdk from 'aws-cdk-lib';
import { SmartResumeDbStack } from '../lib/db-stack';

const app = new cdk.App();

// Load environment variables
const projectName = process.env.PROJECT_NAME || 'default-project';
const stage = process.env.STAGE || 'dev';

// Pass projectName and stage as context to the stack
new SmartResumeDbStack(app, 'SmartResumeDbStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  projectName,
  stage,
});