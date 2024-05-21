import { Handler } from "aws-lambda";
import { SignatureV4 } from "@smithy/signature-v4";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { Sha256 } from "@aws-crypto/sha256-js";
import { HttpRequest } from "@smithy/protocol-http";
declare global {
  namespace awslambda {
    function streamifyResponse(
      f: (event: any, responseStream: NodeJS.WritableStream) => Promise<void>
    ): Handler;
  }
}

type Payload = {
  loadId: string;
};
type BulkLoadResponse = {
  status: string;
  payload: Payload;
};
const signer = new SignatureV4({
  region: "us-east-1",
  service: "neptune-db",
  sha256: Sha256,
  credentials: defaultProvider(),
});
const vertexUri = process.env.VERTEX!;
const edgeUri = process.env.EDGE!;
const iamRoleArn = process.env.ROLE_ARN;
const url = `${process.env.NEPTUNE_ENDPOINT}:${process.env.NEPTUNE_PORT}`;
export const handler: Handler = awslambda.streamifyResponse(
  async (event, responseStream) => {
    try {
      console.log(JSON.stringify(event.body));
      console.log("Start streaming response");
      responseStream.write("Start streaming response\n");
      for await (const source of [vertexUri, edgeUri]) {
        const input = {
          source,
          format: "csv",
          iamRoleArn,
          region: "us-east-1",
          failOnError: "FALSE",
          parallelism: "MEDIUM",
          updateSingleCardinalityProperties: "FALSE",
          queueRequest: "TRUE",
        };
        responseStream.write(`Start bulk load of ${source}\n`);
        const req = await signer.sign(
          new HttpRequest({
            method: "POST",
            protocol: "https:",
            path: "/loader",
            hostname: url,

            headers: {
              "Content-Type": "application/json",
              host: url,
            },
            body: JSON.stringify(input),
          })
        );
        const res = await fetch(`${req.protocol}${req.hostname}${req.path}`, {
          method: req.method,
          body: req.body,
          headers: req.headers,
        });
        const response: BulkLoadResponse = await res.json();
        console.log(response);
        const loadId = response.payload.loadId;

        const loadCheckReq = await signer.sign(
          new HttpRequest({
            method: "GET",
            protocol: "https:",
            path: `/loader/${loadId}`,
            hostname: url,

            headers: {
              "Content-Type": "application/json",
              host: url,
            },
          })
        );
        let status: string = "";
        responseStream.write(`Load status checking of ${source}\n`);
        responseStream.write("Waiting for load status change ....");
        while (status !== "LOAD_COMPLETED") {
          const loadRes = await fetch(
            `${loadCheckReq.protocol}${loadCheckReq.hostname}${loadCheckReq.path}`,
            {
              method: loadCheckReq.method,
              body: loadCheckReq.body,
              headers: loadCheckReq.headers,
            }
          );
          const loadStatus = await loadRes.json();

          console.log(loadStatus);

          responseStream.write("....");
          status = loadStatus.payload.overallStatus.status;
        }
        responseStream.write("\n");
        responseStream.write("Load completed\n");

        responseStream.write(response.status);
        responseStream.write("\n");
      }
    } catch (error: any) {
      console.log({ error });
      responseStream.write(`ERROR: ${error}`);
      responseStream.end();
    }
    responseStream.write("End streaming response");
    responseStream.end();
  }
);
