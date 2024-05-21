#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AwsSolutionsChecks } from "cdk-nag";
import { WebappStack } from "../lib/webapp-stack";

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

const web = new WebappStack(app, `${appName}-WebappStack`, {
  wafParamName: deployConfig.wafParamName,
  webBucketsRemovalPolicy: deployConfig.webBucketsRemovalPolicy,
  env,
});
