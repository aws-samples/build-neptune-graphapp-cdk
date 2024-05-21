import { Stack, StackProps, aws_ec2, aws_iam } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as neptune from "@aws-cdk/aws-neptune-alpha";
import { Network } from "./constructs/network";
import { Neptune } from "./constructs/neptune";

interface NeptuneNetworkStackProps extends StackProps {
  natSubnet?: boolean;
  maxAz: number;
  neptuneServerlss: boolean;
  neptuneServerlssCapacity?: neptune.ServerlessScalingConfiguration;
}

export class NeptuneNetworkStack extends Stack {
  public readonly vpc: aws_ec2.Vpc;
  public readonly cluster: neptune.DatabaseCluster;
  public readonly neptuneRole: aws_iam.Role;
  constructor(scope: Construct, id: string, props: NeptuneNetworkStackProps) {
    super(scope, id, props);

    const { natSubnet, maxAz, neptuneServerlss, neptuneServerlssCapacity } =
      props;

    const network = new Network(this, "network", {
      natSubnet,
      maxAz,
    });
    this.vpc = network.vpc;

    const neptune = new Neptune(this, "neptune", {
      vpc: network.vpc,
      neptuneServerlss,
      neptuneServerlssCapacity,
    });

    this.cluster = neptune.cluster;
    this.neptuneRole = neptune.neptuneRole;
  }
}
