import {
  Stack,
  Duration,
  aws_ec2,
  aws_lambda_nodejs,
  aws_lambda,
  aws_iam,
  CfnOutput,
} from "aws-cdk-lib";
import {
  AuthorizationType,
  Definition,
  FieldLogLevel,
  GraphqlApi,
  MappingTemplate,
  UserPoolDefaultAction,
} from "aws-cdk-lib/aws-appsync";
import { Construct } from "constructs";

import * as neptune from "@aws-cdk/aws-neptune-alpha";

import { NagSuppressions } from "cdk-nag";
import { Cognito } from "./cognito";

export interface BackendApiProps {
  schema: string;
  cognito: Cognito;
  vpc: aws_ec2.Vpc;
  cluster: neptune.DatabaseCluster;
  clusterRole: aws_iam.Role;
  graphqlFieldName: string[];
  s3Uri: S3Uri;
}

export type S3Uri = {
  vertex: string;
  edge: string;
};

export class Api extends Construct {
  readonly graphqlUrl: string;

  constructor(scope: Construct, id: string, props: BackendApiProps) {
    super(scope, id);

    const { schema, vpc, cluster, clusterRole, graphqlFieldName, s3Uri } =
      props;

    // AWS AppSync
    const graphql = new GraphqlApi(this, "graphql", {
      name: id,
      definition: Definition.fromFile(schema),
      logConfig: {
        fieldLogLevel: FieldLogLevel.ERROR,
        role: new aws_iam.Role(this, "appsync-log-role", {
          assumedBy: new aws_iam.ServicePrincipal("appsync.amazonaws.com"),
          inlinePolicies: {
            logs: new aws_iam.PolicyDocument({
              statements: [
                new aws_iam.PolicyStatement({
                  actions: [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents",
                  ],
                  resources: [
                    `arn:aws:logs:${Stack.of(this).region}:${
                      Stack.of(this).account
                    }`,
                  ],
                }),
              ],
            }),
          },
        }),
      },
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: props.cognito.userPool,
            appIdClientRegex: props.cognito.cognitoParams.userPoolClientId,
            defaultAction: UserPoolDefaultAction.ALLOW,
          },
        },
      },
      xrayEnabled: true,
    });

    this.graphqlUrl = graphql.graphqlUrl;

    const lambdaRole = new aws_iam.Role(this, "lambdaRole", {
      assumedBy: new aws_iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    lambdaRole.addToPrincipalPolicy(
      new aws_iam.PolicyStatement({
        resources: ["*"],
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DescribeSubnets",
          "ec2:DeleteNetworkInterface",
          "ec2:AssignPrivateIpAddresses",
          "ec2:UnassignPrivateIpAddresses",
        ],
      })
    );
    cluster.grantConnect(lambdaRole);

    // AWS Lambda for graph application
    const NodejsFunctionBaseProps: aws_lambda_nodejs.NodejsFunctionProps = {
      runtime: aws_lambda.Runtime.NODEJS_20_X,

      // entry: `./api/lambda/${lambdaName}.ts`,
      depsLockFilePath: "./api/lambda/package-lock.json",
      architecture: aws_lambda.Architecture.ARM_64,
      timeout: Duration.minutes(1),
      role: lambdaRole,
      vpc: vpc,
      vpcSubnets: {
        subnets: vpc.isolatedSubnets,
      },
      bundling: {
        nodeModules: ["gremlin", "gremlin-aws-sigv4"],
      },
    };
    const queryFn = new aws_lambda_nodejs.NodejsFunction(this, "queryFn", {
      ...NodejsFunctionBaseProps,
      entry: "./api/lambda/queryGraph.ts",
      environment: {
        NEPTUNE_ENDPOINT: cluster.clusterReadEndpoint.hostname,
        NEPTUNE_PORT: cluster.clusterReadEndpoint.port.toString(),
      },
    });
    graphql.grantQuery(queryFn);
    queryFn.connections.allowTo(cluster, aws_ec2.Port.tcp(8182));

    const mutationFn = new aws_lambda_nodejs.NodejsFunction(
      this,
      "mutationFn",
      {
        ...NodejsFunctionBaseProps,
        entry: "./api/lambda/mutationGraph.ts",
        environment: {
          NEPTUNE_ENDPOINT: cluster.clusterEndpoint.hostname,
          NEPTUNE_PORT: cluster.clusterEndpoint.port.toString(),
        },
      }
    );
    graphql.grantMutation(mutationFn);
    mutationFn.connections.allowTo(cluster, aws_ec2.Port.tcp(8182));

    // Function URL

    const bulkLoadFn = new aws_lambda_nodejs.NodejsFunction(
      this,
      "bulkLoadFn",
      {
        ...NodejsFunctionBaseProps,
        entry: "./api/lambda/functionUrl/index.ts",
        depsLockFilePath: "./api/lambda/functionUrl/package-lock.json",
        environment: {
          NEPTUNE_ENDPOINT: cluster.clusterEndpoint.hostname,
          NEPTUNE_PORT: cluster.clusterEndpoint.port.toString(),
          VERTEX: s3Uri.vertex,
          EDGE: s3Uri.edge,
          ROLE_ARN: clusterRole.roleArn,
        },
        vpcSubnets: {
          subnets: vpc.publicSubnets,
        },
        bundling: {
          nodeModules: [
            "@smithy/signature-v4",
            "@aws-sdk/credential-provider-node",
            "@aws-crypto/sha256-js",
            "@smithy/protocol-http",
          ],
        },
        allowPublicSubnet: true,
      }
    );
    bulkLoadFn.connections.allowTo(cluster, aws_ec2.Port.tcp(8182));

    const functionUrl = bulkLoadFn.addFunctionUrl({
      authType: aws_lambda.FunctionUrlAuthType.AWS_IAM,
      cors: {
        allowedMethods: [aws_lambda.HttpMethod.GET],
        allowedOrigins: ["*"],
        allowedHeaders: ["*"],
      },

      invokeMode: aws_lambda.InvokeMode.RESPONSE_STREAM,
    });

    graphqlFieldName.map((filedName: string) => {
      // Data sources
      const datasource = graphql.addLambdaDataSource(
        `${filedName}DS`,
        filedName.startsWith("get") ? queryFn : mutationFn
      );
      queryFn.addEnvironment("GRAPHQL_ENDPOINT", this.graphqlUrl);
      // Resolver
      datasource.createResolver(`${filedName}Resolver`, {
        fieldName: `${filedName}`,
        typeName: filedName.startsWith("get") ? "Query" : "Mutation",
        requestMappingTemplate: MappingTemplate.fromFile(
          `./api/graphql/resolvers/requests/${filedName}.vtl`
        ),
        responseMappingTemplate: MappingTemplate.fromFile(
          "./api/graphql/resolvers/responses/default.vtl"
        ),
      });
    });

    // Outputs
    new CfnOutput(this, "GraphqlUrl", {
      value: this.graphqlUrl,
    });
    new CfnOutput(this, "FunctionUrl", {
      value: functionUrl.url,
    });

    // Suppressions
    NagSuppressions.addResourceSuppressions(
      graphql,
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Datasorce role",
        },
      ],
      true
    );

    NagSuppressions.addResourceSuppressions(
      lambdaRole,
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Need the permission for accessing database in Vpc",
        },
      ],
      true
    );
    NagSuppressions.addStackSuppressions(Stack.of(this), [
      {
        id: "AwsSolutions-IAM4",
        reason: "CDK managed resource",
        appliesTo: [
          "Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
        ],
      },
      {
        id: "AwsSolutions-L1",
        reason: "CDK managed resource",
      },
      {
        id: "AwsSolutions-IAM5",
        reason: "CDK managed resource",
        appliesTo: ["Resource::*"],
      },
    ]);
  }
}
