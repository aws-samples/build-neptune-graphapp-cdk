import { Stack, StackProps, Duration, aws_ec2, aws_iam } from "aws-cdk-lib";
import { Construct } from "constructs";

import { Cognito } from "./constructs/cognito";
import * as neptune from "@aws-cdk/aws-neptune-alpha";
import { Api, S3Uri } from "./constructs/api";
import * as path from "path";

interface ApiStackProps extends StackProps {
  buildApiWithCDK: boolean;
  cognito: {
    adminEmail: string;
    userName?: string;
  };
  vpc: aws_ec2.Vpc;
  cluster: neptune.DatabaseCluster;
  clusterRole: aws_iam.Role;
  graphqlFieldName: string[];
  s3Uri: S3Uri;
}

export class ApiStack extends Stack {
  public readonly cognito: Cognito | undefined;
  public readonly graphqlUrl: string;
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    const {
      buildApiWithCDK,
      cognito,
      vpc,
      cluster,
      clusterRole,
      graphqlFieldName,
      s3Uri,
    } = props;
    super(scope, id, props);
    this.cognito = buildApiWithCDK
      ? new Cognito(this, "cognito", {
          adminEmail: cognito.adminEmail,
          userName: cognito.userName,
          refreshTokenValidity: Duration.days(1),
        })
      : undefined;
    const api = new Api(this, "api", {
      buildApiWithCDK,
      schema: path.join(__dirname, "../api/graphql/schema.graphql"),
      vpc,
      cluster,
      clusterRole,
      cognito: this.cognito,
      graphqlFieldName,
      s3Uri,
    });
    this.graphqlUrl = api.graphqlUrl;
  }
}
