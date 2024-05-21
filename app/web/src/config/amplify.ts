import { ResourcesConfig } from "aws-amplify";

const config: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolClientId: import.meta.env.VITE_COGNITO_USERPOLL_CLIENTID,
      userPoolId: import.meta.env.VITE_COGNITO_USERPOOLID,
      identityPoolId: import.meta.env.VITE_COGNITO_IDENTITYPOOLID,
    },
  },

  // API Gateway
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_GRAPHQL_URL,
      defaultAuthMode: "userPool",
    },
  },
};

export default config;
