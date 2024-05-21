// Set up a Router instance
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen.js";
``;
export const router = createRouter({
  routeTree,
  context: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    auth: undefined,
  },
});
