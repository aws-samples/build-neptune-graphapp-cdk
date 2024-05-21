import * as neptune from "@aws-cdk/aws-neptune-alpha";
import {
  Duration,
  RemovalPolicy,
  StackProps,
  aws_ec2,
  aws_iam,
  aws_logs,
} from "aws-cdk-lib";
import { NagSuppressions } from "cdk-nag";

import { Construct } from "constructs";

interface NeptuneProps extends StackProps {
  vpc: aws_ec2.Vpc;
  neptuneServerlss: boolean;
  neptuneServerlssCapacity?: neptune.ServerlessScalingConfiguration;
}

export class Neptune extends Construct {
  public readonly cluster: neptune.DatabaseCluster;
  readonly neptuneRole: aws_iam.Role;
  constructor(scope: Construct, id: string, props: NeptuneProps) {
    super(scope, id);
    const { vpc, neptuneServerlss, neptuneServerlssCapacity } = props;
    this.neptuneRole = new aws_iam.Role(this, "neptune-role", {
      assumedBy: new aws_iam.ServicePrincipal("rds.amazonaws.com"),
    });
    this.neptuneRole.addToPolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: ["s3:Get*", "s3:List*"],
        resources: ["*"],
      })
    );

    let neptuneBaseClusterConfiguration: any = {
      iamAuthentication: true,
      cloudwatchLogsRetention: aws_logs.RetentionDays.ONE_MONTH,
      removalPolicy: RemovalPolicy.DESTROY,
      engineVersion: neptune.EngineVersion.V1_3_0_0,
      autoMinorVersionUpgrade: true,
      backupRetention: Duration.days(14),
      associatedRoles: [this.neptuneRole],
    };

    if (neptuneServerlss) {
      let serverlessScalingConfiguration = {
        minCapacity: 1,
        maxCapacity: 2.5,
      };
      if (neptuneServerlssCapacity) {
        (serverlessScalingConfiguration.minCapacity =
          neptuneServerlssCapacity.minCapacity),
          (serverlessScalingConfiguration.maxCapacity =
            neptuneServerlssCapacity.maxCapacity);
      }
      neptuneBaseClusterConfiguration = {
        ...neptuneBaseClusterConfiguration,
        serverlessScalingConfiguration,
      };
    }

    // if (neptuneServerlss) {
    this.cluster = new neptune.DatabaseCluster(this, "cluster", {
      vpc: vpc,
      instanceType: neptuneServerlss
        ? neptune.InstanceType.SERVERLESS
        : neptune.InstanceType.R5_XLARGE,
      ...neptuneBaseClusterConfiguration,

      vpcSubnets: {
        subnets: vpc.isolatedSubnets,
      },
    });

    this.cluster.grantConnect(this.neptuneRole);

    NagSuppressions.addResourceSuppressions(
      this.neptuneRole,
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Need the permission for bulk load",
        },
      ],
      true
    );
  }
}
