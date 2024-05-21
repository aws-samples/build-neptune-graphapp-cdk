import { ModeToggle } from "@/components/mode-toggles";
import { AuthStore, useAuthStore } from "@/store/useAuthStore";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Signin } from "./_auth/signin";

interface RouterContext {
  // The ReturnType of your useAuth hook or the value of your AuthContext
  auth: AuthStore;
}
export const isAuth = false;
export const Route = createRootRouteWithContext<RouterContext>()({
  component: Root,
});

function Root() {
  const auth = useAuthStore();
  return (
    <div className="min-h-screen w-dvw">
      <ModeToggle />

      {!auth.isAuth ? (
        <Signin />
      ) : (
        <>
          <Outlet />
          <TanStackRouterDevtools
            position="bottom-right"
            initialIsOpen={false}
          />
        </>
      )}
    </div>
  );
}
