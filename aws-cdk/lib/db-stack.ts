import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VpcConstruct } from './vpc-construct';
import { DatabaseConstruct } from './database-construct';
import * as route53 from 'aws-cdk-lib/aws-route53';

export interface SmartResumeDbStackProps extends cdk.StackProps {
  projectName: string; // Project name (e.g., 'ai-resume')
  stage: string; // Stage (e.g., 'dev', 'prod')
}

export class SmartResumeDbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SmartResumeDbStackProps) {
    super(scope, id, props);

    const { projectName, stage } = props;

    // Step 1: Create a VPC
    const vpcConstruct = new VpcConstruct(this, 'VpcConstruct', {
      projectName,
      stage,
    });
    const vpc = vpcConstruct.vpc;

    // Step 2: Create a Database
    const databaseConstruct = new DatabaseConstruct(this, 'DatabaseConstruct', {
      vpc,
      projectName,
      stage,
    });

      // Step 3: Import the existing hosted zone for resynox.com
      const hostedZone = route53.HostedZone.fromLookup(this, 'ResynoxHostedZone', {
        domainName: 'resynox.com',
      });

      // Step 4: Create a CNAME record for the RDS endpoint
      new route53.CnameRecord(this, 'RdsCnameRecord', {
        zone: hostedZone,
        recordName: 'db.resynox.com', // Custom domain name
        domainName: databaseConstruct.db.dbInstanceEndpointAddress, // RDS endpoint
      });

      // Step 5: Output the custom domain name
      new cdk.CfnOutput(this, 'CustomDbEndpoint', {
        value: 'db.resynox.com',
        description: 'Custom domain name for the RDS endpoint',
      });

      // Step 6: Output database connection details
      new cdk.CfnOutput(this, 'DBEndpoint', {
        value: databaseConstruct.db.dbInstanceEndpointAddress,
      });

      new cdk.CfnOutput(this, 'SecretName', {
        value: databaseConstruct.dbCredentialsSecret.secretName,
      });
  }
}