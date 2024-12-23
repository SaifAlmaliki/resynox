#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SmartResumeDbStack } from '../lib/db-stack';

const app = new cdk.App();
new SmartResumeDbStack(app, 'SmartResumeDbStack');
