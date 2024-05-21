import { RemovalPolicy, StackProps, aws_ec2, aws_logs } from "aws-cdk-lib";
import { NagSuppressions } from "cdk-nag";

import { Construct } from "constructs";

interface NetworkProps extends StackProps {
  natSubnet?: boolean;
  maxAz: number;
}
export class Network extends Construct {
  public readonly vpc: aws_ec2.Vpc;
  constructor(scope: Construct, id: string, props: NetworkProps) {
    super(scope, id);
    const { natSubnet, maxAz } = props;

    const cwLogs = new aws_logs.LogGroup(this, "vpc-logs", {
      logGroupName: `/${id}/vpc-logs/`,
      removalPolicy: RemovalPolicy.DESTROY,
      retention: aws_logs.RetentionDays.TWO_MONTHS,
    });

    const subnetConfiguration: aws_ec2.SubnetConfiguration[] = [
      {
        subnetType: aws_ec2.SubnetType.PUBLIC,
        name: "public-subnet",
      },
      {
        subnetType: aws_ec2.SubnetType.PRIVATE_ISOLATED,
        name: "neptune-isolated-subnet",
      },
    ];

    if (natSubnet) {
      subnetConfiguration.push({
        subnetType: aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
        name: "nat-subnet",
      });
    }

    const vpcBaseProps: any = {
      maxAzs: maxAz,
      subnetConfiguration,
      flowLogs: {
        s3: {
          destination: aws_ec2.FlowLogDestination.toCloudWatchLogs(cwLogs),
          trafficType: aws_ec2.FlowLogTrafficType.ALL,
        },
      },
      gatewayEndpoints: {
        S3: {
          service: aws_ec2.GatewayVpcEndpointAwsService.S3,
        },
      },
    };
    if (props.natSubnet) {
      const eipAllocationForNat = [];
      const eipAllocationIds: string[] = [];

      for (let i = 0; i < maxAz; i++) {
        const eip = new aws_ec2.CfnEIP(this, `${id}-nat-eip${i}`, {});
        eipAllocationForNat.push(eip.attrPublicIp);
        eipAllocationIds.push(eip.attrAllocationId);
      }

      vpcBaseProps.natGatewayProvider = aws_ec2.NatProvider.gateway({
        eipAllocationIds,
      });
    }

    const vpcProps: aws_ec2.VpcProps = vpcBaseProps;
    this.vpc = new aws_ec2.Vpc(this, "vpc", vpcProps);

    // Create endpoint
    const CWEndpoint = new aws_ec2.InterfaceVpcEndpoint(this, "cw-vep", {
      service: aws_ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_MONITORING,
      vpc: this.vpc,
      privateDnsEnabled: true,
    });

    const CWLEndpoint = new aws_ec2.InterfaceVpcEndpoint(this, "cwl-vep", {
      service: aws_ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      vpc: this.vpc,
      privateDnsEnabled: true,
    });

    // Nag supressions
    NagSuppressions.addResourceSuppressions(
      [CWEndpoint, CWLEndpoint],
      [
        {
          id: "CdkNagValidationFailure",
          reason: "Suppressed: Managed by privatelink construct",
        },
      ],
      true
    );
  }
}
