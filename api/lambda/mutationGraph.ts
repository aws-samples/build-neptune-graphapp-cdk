import { Handler } from "aws-lambda";

import * as gremlin from "gremlin";
import { getUrlAndHeaders } from "gremlin-aws-sigv4/lib/utils";

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const P = gremlin.process.P;
const traversal = gremlin.process.AnonymousTraversalSource.traversal;
const __ = gremlin.process.statics;

export const handler: Handler = async (event) => {
  let conn = null;
  const getConnectionDetails = () => {
    return getUrlAndHeaders(
      process.env.NEPTUNE_ENDPOINT,
      process.env.NEPTUNE_PORT,
      {},
      "/gremlin",
      "wss"
    );
  };

  const createRemoteConnection = () => {
    const { url, headers } = getConnectionDetails();

    console.log(url);
    console.log(headers);
    const c = new DriverRemoteConnection(url, {
      mimeType: "application/vnd.gremlin-v2.0+json",
      headers: headers,
    });
    c._client._connection.on("close", (code, message) => {
      console.info(`close - ${code} ${message}`);
      if (code == 1006) {
        console.error("Connection closed prematurely");
        throw new Error("Connection closed prematurely");
      }
    });
    return c;
  };

  let g;
  const id = gremlin.process.t.id;
  const {
    value,
    name,
    edge,
    vertex,
    property,
    source,
    sourceLabel,
    destination,
    destLabel,
  } = event.arguments.input;

  try {
    if (conn == null) {
      console.info("Initializing connection");
      conn = createRemoteConnection();
      g = traversal().withRemote(conn);
    }
    switch (value) {
      case "vertex":
        const currentId = await g.V().hasLabel(vertex).toList();
        const new_id = currentId.length + 1;
        switch (vertex) {
          case "person":
            const person_id = "Doc" + new_id;
            const vertex1 = await g
              .addV(vertex)
              .property(id, person_id)
              .property("name", name)
              .property("speciality", property)
              .next();
            return { result: vertex1 };
          case "paper":
            const paper_id = "Paper" + new_id;
            const vertex2 = await g
              .addV(vertex)
              .property(id, paper_id)
              .property("name", name)
              .property("speciality", property)
              .next();
            return { result: vertex2 };
          case "conference":
            const conf_id = "Conf" + new_id;
            const vertex3 = await g
              .addV(vertex)
              .property(id, conf_id)
              .property("name", name)
              .next();
            return { result: vertex3 };
          case "product":
            const prod_id = "Prod" + new_id;
            const vertex4 = await g
              .addV(vertex)
              .property(id, prod_id)
              .property("name", name)
              .next();
            return { result: vertex4 };
          default:
            const inst_id = "Inst" + new_id;
            const vertex5 = await g
              .addV(vertex)
              .property(id, inst_id)
              .property("name", name)
              .next();
            return { result: vertex5 };
        }
      default:
        console.log("edge");
        const res = await g
          .V()
          .hasLabel(sourceLabel)
          .has("name", source)
          .addE(edge)
          .to(__.V().hasLabel(destLabel).has("name", destination))
          .next();
        return { result: res };
    }
  } catch (error: any) {
    console.log(error);
    console.error(JSON.stringify(error));
    return { error: error.message };
  }
};
