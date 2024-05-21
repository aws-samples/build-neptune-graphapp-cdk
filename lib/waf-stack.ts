import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Waf } from "./constructs/waf";

interface WafStacktackProps extends cdk.StackProps {
  allowedIps: string[];
  wafParamName: string;
}

export class WafCloudFrontStack extends cdk.Stack {
  readonly webAcl: cdk.aws_wafv2.CfnWebACL;
  constructor(scope: Construct, id: string, props: WafStacktackProps) {
    super(scope, id, props);

    const { allowedIps, wafParamName } = props;

    //  AWS WAF
    const wafv2 = new Waf(this, "cloudfront-waf", {
      allowedIps,
      useCloudFront: true,
      wafParamName,
    });
    this.webAcl = wafv2.waf;
  }
}
