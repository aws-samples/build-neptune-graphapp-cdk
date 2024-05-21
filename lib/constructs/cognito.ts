import { Construct } from "constructs";
import {
  Duration,
  RemovalPolicy,
  aws_cognito,
  aws_iam,
  CfnOutput,
} from "aws-cdk-lib";

import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";

import {
  IdentityPool,
  UserPoolAuthenticationProvider,
} from "@aws-cdk/aws-cognito-identitypool-alpha";
import { NagSuppressions } from "cdk-nag";

export interface CognitoProps {
  adminEmail: string;
  userName?: string;
  refreshTokenValidity?: Duration;
}

export interface CognitoParams {
  userPoolId: string;
  userPoolClientId: string;
  identityPoolId: string;
}

export class Cognito extends Construct {
  public readonly cognitoParams: CognitoParams;
  public readonly userPool: aws_cognito.UserPool;
  constructor(scope: Construct, id: string, props: CognitoProps) {
    super(scope, id);

    if (!props.userName) props.userName = props.adminEmail.split("@")[0];

    this.userPool = new aws_cognito.UserPool(this, "userpool", {
      userPoolName: `${id}-app-userpool`,
      signInAliases: {
        username: true,
        email: true,
      },
      accountRecovery: aws_cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.DESTROY,
      selfSignUpEnabled: false,
      advancedSecurityMode: aws_cognito.AdvancedSecurityMode.ENFORCED,
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
    });

    const userPoolClient = this.userPool.addClient("webappClient", {
      authFlows: {
        userSrp: true,
        adminUserPassword: true,
      },
      preventUserExistenceErrors: true,
      refreshTokenValidity: props.refreshTokenValidity,
    });

    const identityPool = new IdentityPool(this, "identityPool", {
      allowUnauthenticatedIdentities: false,
      authenticationProviders: {
        userPools: [
          new UserPoolAuthenticationProvider({
            userPool: this.userPool,
            userPoolClient,
          }),
        ],
      },
    });

    new CreatePoolUser(this, "admin-user", {
      email: props.adminEmail,
      username: props.userName,
      userPool: this.userPool,
    });

    this.cognitoParams = {
      userPoolId: this.userPool.userPoolId,
      userPoolClientId: userPoolClient.userPoolClientId,
      identityPoolId: identityPool.identityPoolId,
    };

    new CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
    });
    new CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
    new CfnOutput(this, "IdentityPoolId", {
      value: identityPool.identityPoolId,
    });

    // Suppressions
    NagSuppressions.addResourceSuppressions(this.userPool, [
      {
        id: "AwsSolutions-COG2",
        reason: "No need MFA for sample",
      },
    ]);
  }
}

class CreatePoolUser extends Construct {
  public readonly username: string | undefined;
  constructor(
    scope: Construct,
    id: string,
    props: {
      userPool: aws_cognito.IUserPool;
      username: string;
      email: string | undefined;
    }
  ) {
    super(scope, id);

    const statement = new aws_iam.PolicyStatement({
      actions: ["cognito-idp:AdminDeleteUser", "cognito-idp:AdminCreateUser"],
      resources: [props.userPool.userPoolArn],
    });

    new AwsCustomResource(this, `CreateUser-${id}`, {
      onCreate: {
        service: "CognitoIdentityServiceProvider",
        action: "adminCreateUser",
        parameters: {
          UserPoolId: props.userPool.userPoolId,
          Username: props.username,
          UserAttributes: [
            {
              Name: "email",
              Value: props.email,
            },
            {
              Name: "email_verified",
              Value: "true",
            },
          ],
        },
        physicalResourceId: PhysicalResourceId.of(
          `CreateUser-${id}-${props.username}`
        ),
      },
      onDelete: {
        service: "CognitoIdentityServiceProvider",
        action: "adminDeleteUser",
        parameters: {
          UserPoolId: props.userPool.userPoolId,
          Username: props.username,
        },
      },
      policy: AwsCustomResourcePolicy.fromStatements([statement]),
    });
  }
}
