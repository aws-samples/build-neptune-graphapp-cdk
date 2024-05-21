import { createFileRoute, redirect } from "@tanstack/react-router";

// src/routes/_authenticated.tsx
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuth) {
      throw redirect({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        to: "/signin",
        throw: true,
        // search: {
        //   redirect: location.href,
        // },
      });
    }
  },
});
