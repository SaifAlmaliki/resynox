import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

/**
 * SmartResumeDbStack:
 * - Creates a VPC for network isolation.
 * - Sets up an RDS PostgreSQL database instance within the VPC.
 * - Manages database credentials using AWS Secrets Manager.
 * - Outputs the database endpoint and secret name for external reference.
 */
export class SmartResumeDbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Step 1: Create a VPC
     * - This VPC will provide network isolation for the database.
     * - Limits to 2 availability zones for cost-efficiency.
     */
    const vpc = new ec2.Vpc(this, 'AIResumeVPC', {
      maxAzs: 2, // Default is all availability zones in the region
    });

    /**
     * Step 2: Create a Secrets Manager secret
     * - Stores database credentials securely.
     * - Auto-generates a strong password for the database user.
     */
    const dbCredentialsSecret = new secretsmanager.Secret(this, 'DBCredentialsSecret', {
      secretName: 'ai-resume-db-credentials', // Name of the secret
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'db_admin' }), // Static username
        generateStringKey: 'password',      // Key for the generated password
      },
    });

    /**
     * Step 3: Create a Security Group
     * - Allows PostgreSQL access from anywhere.
     */
    const securityGroup = new ec2.SecurityGroup(this, 'DBSecurityGroup', {
      vpc,
      description: 'Allow PostgreSQL access',
      allowAllOutbound: true,
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5432), 'Allow PostgreSQL access from anywhere');

    /**
     * Step 4: Set up an RDS PostgreSQL Database
     * - Configures a managed PostgreSQL database instance.
     * - Utilizes the previously created VPC and Secrets Manager credentials.
     */
    const db = new rds.DatabaseInstance(this, 'AIResumeDB', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14, // PostgreSQL version 14
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3, // Cost-efficient instance type
        ec2.InstanceSize.MICRO        // Small instance size for low traffic
      ),
      vpc, // Associates the database with the VPC
      credentials: rds.Credentials.fromSecret(dbCredentialsSecret), // Uses the secret for credentials
      multiAz: false,           // Single AZ deployment for cost-efficiency (not recommended for production)
      allocatedStorage: 20,     // Initial storage in GB
      maxAllocatedStorage: 100, // Maximum storage in GB (auto-scaling)
      publiclyAccessible: true, // Allows public access (for development/testing; not recommended for production)
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC, // Places the database in public subnets
      },
      securityGroups: [securityGroup], // Associates the security group with the database
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Deletes the database on stack removal (not recommended for production)
      databaseName: 'airesumedb', // Name of the database to be created
    });

    /**
     * Step 5: Add tags to the database instance
     * - Useful for organization, billing, and resource tracking.
     */
    cdk.Tags.of(db).add('Project', 'ai-resume');

    /**
     * Step 6: Output database connection details
     * - Outputs the database endpoint and the name of the Secrets Manager secret.
     * - These values can be used to connect to the database externally.
     */
    new cdk.CfnOutput(this, 'DBEndpoint', {
      value: db.dbInstanceEndpointAddress, // Outputs the database endpoint
    });

    new cdk.CfnOutput(this, 'SecretName', {
      value: dbCredentialsSecret.secretName, // Outputs the name of the secret
    });
  }
}
