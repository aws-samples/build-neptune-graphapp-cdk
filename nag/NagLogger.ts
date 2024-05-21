import {
  INagLogger,
  NagLoggerComplianceData,
  NagLoggerErrorData,
  NagLoggerNotApplicableData,
  NagLoggerSuppressedData,
  NagLoggerSuppressedErrorData,
  NagMessageLevel,
} from "cdk-nag";

const color = {
  black: "\u001b[30m",
  red: "\u001b[31m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  blue: "\u001b[34m",
  magenta: "\u001b[35m",
  cyan: "\u001b[36m",
  white: "\u001b[37m",
};
// const red = "\u001b[31m";
// const yellow = "\u001b[33m";
// const blue = "\u001b[34m";
export class NagLogger implements INagLogger {
  onCompliance(data: NagLoggerComplianceData): void {}
  onNonCompliance(data: NagLoggerComplianceData): void {
    if (data.ruleLevel === NagMessageLevel.WARN) {
      console.log(
        `${color.yellow}[${data.ruleLevel} at ${data.resource.node.path}]${data.ruleId} ${data.resource.cfnResourceType}  ${data.ruleInfo}`
      );
    } else {
      console.log(
        `${color.red} [${data.ruleLevel} at ${data.resource.node.path}] ${data.ruleId} ${data.resource.cfnResourceType} ${data.ruleInfo}`
      );
    }
  }
  onSuppressed(data: NagLoggerSuppressedData): void {
    console.log(
      `${color.blue}[Suppressed ${data.ruleLevel} ${data.ruleId} ${data.resource.cfnResourceType} at ${data.resource.node.path}]  Reason: ${data.suppressionReason} `
    );
  }
  onError(data: NagLoggerErrorData): void {
    console.log(
      `${color.magenta} [${data.ruleLevel} at ${data.resource.node.path}] ${data.ruleId} ${data.resource.cfnResourceType} ${data.ruleInfo}`
    );
  }
  onSuppressedError(data: NagLoggerSuppressedErrorData): void {
    console.log(
      `${color.red} [${data.errorSuppressionReason} at ${data.resource.node.path}][${data.ruleLevel} ${data.ruleId}${data.resource.cfnResourceType}] `
    );
  }
  onNotApplicable(data: NagLoggerNotApplicableData): void {}
}
