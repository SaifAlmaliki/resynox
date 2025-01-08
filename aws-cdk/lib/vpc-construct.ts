import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface VpcConstructProps {
  projectName: string; // Project name (e.g., 'ai-resume')
  stage: string; // Stage (e.g., 'dev', 'prod')
}

export class VpcConstruct extends Construct {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: VpcConstructProps) {
    super(scope, id);

    const { projectName, stage } = props;

    // Create a VPC with a name that includes projectName and stage
    this.vpc = new ec2.Vpc(this, 'ResynoxVPC', {
      maxAzs: 2,
      vpcName: `${projectName}-${stage}-vpc`, // Example: 'resynox-dev-vpc'
    });
  }
}