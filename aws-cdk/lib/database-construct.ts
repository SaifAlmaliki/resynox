import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface DatabaseConstructProps {
  vpc: ec2.Vpc; // VPC where the database will be deployed
  projectName: string; // Project name (e.g., 'ai-resume')
  stage: string; // Stage (e.g., 'dev', 'prod')
}

export class DatabaseConstruct extends Construct {
  public readonly db: rds.DatabaseInstance;
  public readonly dbCredentialsSecret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, props: DatabaseConstructProps) {
    super(scope, id);

    const { vpc, projectName, stage } = props;

    // Create a Secrets Manager secret with a name that includes projectName and stage
    this.dbCredentialsSecret = new secretsmanager.Secret(this, 'DBCredentialsSecret', {
      secretName: `${projectName}-${stage}-db-credentials`, // Example: 'ai-resume-dev-db-credentials'
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'db_admin' }),
        generateStringKey: 'password',
        excludeCharacters: '/@" ', // Exclude invalid characters
        passwordLength: 16, // Set a reasonable password length
        requireEachIncludedType: true, // Ensure the password includes uppercase, lowercase, numbers, and special characters
      },
    });

    // Create a Security Group with a name that includes projectName and stage
    const securityGroup = new ec2.SecurityGroup(this, 'DBSecurityGroup', {
      vpc,
      description: 'Allow PostgreSQL access',
      allowAllOutbound: true,
      securityGroupName: `${projectName}-${stage}-db-sg`, // Example: 'resynox-dev-db-sg'
    });

    // Apply removal policy to security group
    securityGroup.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // Add ingress rule with removal policy
    const ingressRule = securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from anywhere'
    );

    // Set up an RDS PostgreSQL Database with a name that includes projectName and stage
    this.db = new rds.DatabaseInstance(this, 'ResynoxDB', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      vpc,
      credentials: rds.Credentials.fromSecret(this.dbCredentialsSecret),
      multiAz: false,
      allocatedStorage: 20,
      maxAllocatedStorage: 50,
      publiclyAccessible: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroups: [securityGroup],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
      databaseName: `${projectName}${stage}db`, // Example: 'resynoxdevdb'
      autoMinorVersionUpgrade: true,
      backupRetention: cdk.Duration.days(7),
      monitoringInterval: cdk.Duration.seconds(60),
      deleteAutomatedBackups: true,
      enablePerformanceInsights: false,
    });

    // Add dependency to ensure proper deletion order
    this.db.node.addDependency(securityGroup);

    // Add tags to the database instance
    cdk.Tags.of(this.db).add('Project', projectName);
    cdk.Tags.of(this.db).add('Stage', stage);
  }
}