import { Handler } from "aws-lambda";

import * as gremlin from "gremlin";
import { getUrlAndHeaders } from "gremlin-aws-sigv4/lib/utils";

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const P = gremlin.process.P;
const traversal = gremlin.process.AnonymousTraversalSource.traversal;
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

  const type = event.arguments.type;
  console.log(type);
  try {
    if (conn == null) {
      console.info("Initializing connection");
      conn = createRemoteConnection();
      g = traversal().withRemote(conn);
    }
    if (type === "profile") {
      console.log(g);
      let usage;
      let belong_to;
      let authored_by;
      let affiliated_with;
      let people;
      let made_by;
      let search_name = await g!
        .V(event.arguments.name)
        .values("name")
        .toList();
      switch (event.arguments.value) {
        case "person":
          usage = await g
            .V()
            .has(event.arguments.value, "name", event.arguments.name)
            .bothE()
            .hasLabel("usage")
            .otherV()
            .values("name")
            .toList();
          belong_to = await g
            .V()
            .has(event.arguments.value, "name", event.arguments.name)
            .bothE()
            .hasLabel("belong_to")
            .otherV()
            .values("name")
            .toList();
          authored_by = await g
            .V()
            .has(event.arguments.value, "name", event.arguments.name)
            .bothE()
            .hasLabel("authored_by")
            .otherV()
            .values("name")
            .toList();
          affiliated_with = await g
            .V()
            .has(event.arguments.value, "name", event.arguments.name)
            .bothE()
            .hasLabel("affiliated_with")
            .otherV()
            .values("name")
            .toList();
          return [
            { search_name, usage, belong_to, authored_by, affiliated_with },
          ];
        case "id":
          usage = await g
            .V()
            .hasId(event.arguments.name)
            .bothE()
            .hasLabel("usage")
            .otherV()
            .values("name")
            .toList();
          if (event.arguments.name.match(/Doc/)) {
            belong_to = await g
              .V()
              .hasId(event.arguments.name)
              .bothE()
              .hasLabel("belong_to")
              .otherV()
              .values("name")
              .toList();
          } else {
            belong_to = [];
          }
          authored_by = await g
            .V()
            .hasId(event.arguments.name)
            .bothE()
            .hasLabel("authored_by")
            .otherV()
            .values("name")
            .toList();
          affiliated_with = await g
            .V()
            .hasId(event.arguments.name)
            .bothE()
            .hasLabel("affiliated_with")
            .otherV()
            .values("name")
            .toList();
          if (event.arguments.name.match(/Prod/)) {
            made_by = await g
              .V()
              .hasId(event.arguments.name)
              .out("made_by")
              .values("name")
              .toList();
          } else {
            made_by = [];
          }
          if (event.arguments.name.match(/Conf/)) {
            people = await g
              .V()
              .hasId(event.arguments.name)
              .in_()
              .values("name")
              .toList();
          } else {
            people = [];
          }
          if (event.arguments.name.match(/Inst/)) {
            affiliated_with = [];
          }
          return [
            {
              search_name,
              usage,
              belong_to,
              authored_by,
              affiliated_with,
              made_by,
              people,
            },
          ];
        case "product":
          console.log(event.arguments);
          made_by = await g
            .V()
            .has(event.arguments.value, "name", event.arguments.name)
            .out("made_by")
            .values("name")
            .toList();
          return [{ search_name, made_by }];
        case "conference":
          console.log(event.arguments);
          people = await g
            .V()
            .has(event.arguments.value, "name", event.arguments.name)
            .in_()
            .values("name")
            .toList();
          return [{ search_name, people }];
        default:
          console.log("default");
      }
    } else if (type === "relation") {
      switch (event.arguments.value) {
        case "person":
          const result = await g
            .V()
            .has(event.arguments.value, "name", event.arguments.name)
            .as(event.arguments.value)
            .out("belong_to")
            .in_()
            .where(P.neq(event.arguments.value))
            .values("name")
            .dedup()
            .toList();
          return result.map((r: string) => {
            return { name: r };
          });

        case "product":
          const result2 = await g
            .V()
            .has(event.arguments.value, "name", event.arguments.name)
            .as(event.arguments.value)
            .in_("usage")
            .as("p")
            .in_("authored_by")
            .out()
            .where(P.neq("p"))
            .values("name")
            .dedup()
            .toList();
          return result2.map((r: string) => {
            return { name: r };
          });
        case "conference":
          console.log(event.arguments);
          const result3 = await g
            .V()
            .has(event.arguments.value, "name", event.arguments.name)
            .as(event.arguments.value)
            .in_()
            .as("p")
            .out()
            .hasLabel("person")
            .where(P.neq("p"))
            .values("name")
            .dedup()
            .toList();
          console.log(result3);
          return result3.map((r: string) => {
            return { name: r };
          });
        default:
          console.log("default");
      }
    } else {
      const result = await g.V().toList();
      const vertex = result.map((r: any) => {
        return { id: r.id, label: r.label };
      });
      const result2 = await g.E().toList();
      const edge = result2.map((r: any) => {
        console.log(r);
        return { source: r.outV.id, target: r.inV.id, value: r.label };
      });
      return { nodes: vertex, links: edge };
    }
  } catch (error: any) {
    console.log(error);
    console.error(JSON.stringify(error));
    return { error: error.message };
  }
};
