#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { NeptuneNetworkStack } from "../lib/neptune-network-stack";
import { ApiStack } from "../lib/api-stack";
import { WafCloudFrontStack } from "../lib/waf-stack";
import { AwsSolutionsChecks } from "cdk-nag";

import { deployConfig } from "../config";
import { NagLogger } from "../nag/NagLogger";

const app = new cdk.App();
const logger = new NagLogger();

cdk.Aspects.of(app).add(
  new AwsSolutionsChecks({ verbose: true, additionalLoggers: [logger] })
);

const appName = deployConfig.appName || "graphApp";
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: deployConfig.region || process.env.CDK_DEFAULT_REGION,
};
const neptuneNetwork = new NeptuneNetworkStack(
  app,
  `${appName}-NeptuneNetworkStack`,
  {
    natSubnet: false,
    maxAz: 2,
    neptuneServerlss: true,
    neptuneServerlssCapacity: {
      minCapacity: 1,
      maxCapacity: 2.5,
    },
    env,
  }
);

new ApiStack(app, `${appName}-ApiStack`, {
  cognito: {
    adminEmail: deployConfig.adminEmail,
  },
  vpc: neptuneNetwork.vpc,
  cluster: neptuneNetwork.cluster,
  clusterRole: neptuneNetwork.neptuneRole,
  graphqlFieldName: ["getGraph", "getProfile", "getRelationName", "insertData"],
  s3Uri: deployConfig.s3Uri,
  env,
});

new WafCloudFrontStack(app, `${appName}-WafStack`, {
  allowedIps: deployConfig.allowedIps,
  wafParamName: deployConfig.wafParamName,
  env: {
    ...env,
    region: "us-east-1",
  },
});
