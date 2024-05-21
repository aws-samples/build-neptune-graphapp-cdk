import { readFile, writeFile } from "fs/promises";
import lodash from "lodash";
const envFile = "./app/web/.env";
const { startsWith } = lodash;

let cdkOutputData = {};

async function append(data) {
  await writeFile(envFile, data, { flag: "a" }, (err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return;
    }
  });
}

async function buildWebAppEnv() {
  let data = await readFile(new URL("./cdk-infra.json", import.meta.url));
  cdkOutputData = data ? JSON.parse(data) : {};
  let stageKeys = {};

  Object.keys(cdkOutputData).every((key) => {
    if (startsWith(key, "graphApp-Api")) {
      stageKeys = cdkOutputData[key];
      return false;
    }
    return true;
  });
  Object.keys(stageKeys).forEach((key) => {
    key.includes("cognitoUserPoolId")
      ? append(`VITE_COGNITO_USERPOOLID=${stageKeys[key]}\n`)
      : "";
    key.includes("cognitoUserPoolClientId")
      ? append(`VITE_COGNITO_USERPOLL_CLIENTID=${stageKeys[key]}\n`)
      : "";
    key.includes("cognitoIdentityPoolId")
      ? append(`VITE_COGNITO_IDENTITYPOOLID=${stageKeys[key]}\n`)
      : "";
    key.includes("apiGraphqlUrl")
      ? append(`VITE_GRAPHQL_URL=${stageKeys[key]}\n`)
      : "";
    key.includes("region")
      ? append(`VITE_COGNITO_REGION=${stageKeys[key]}\n`)
      : "";
  });
}

await writeFile(envFile, "", { flag: "w+" }, (err) => {
  if (err) {
    console.error(err);
    return;
  }
});

await buildWebAppEnv();
