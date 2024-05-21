import { RemovalPolicy } from "aws-cdk-lib";

/* Base config */
const stage = "dev";
const baseConfig = {
  appName: "graphApp",
  region: "us-east-1",
  buildApiWithCDK: true,
  adminEmail: "your_email@acme.com",
  allowedIps: [],
  wafParamName: "graphAppWafWebACLID",
  webBucketsRemovalPolicy: RemovalPolicy.DESTROY,
  s3Uri: {
    edge: "EDGE_S3_URI",
    vertex: "VERTEX_S3_URI",
  },
};

const deployConfig = { ...baseConfig, stage };

export { deployConfig };
