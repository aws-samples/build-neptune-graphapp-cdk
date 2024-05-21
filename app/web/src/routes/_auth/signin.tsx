import { UserAuthForm } from "@/components/auth-form";
import { UserNewPasswordForm } from "@/components/auth-newpassword-form";
import { useAuthStore } from "@/store/useAuthStore";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_auth/signin")({
  component: Signin,
});
export function Signin() {
  const signInStep = useAuthStore((state) => state.signInStep);

  const getState = useAuthStore.getState();
  useEffect(() => {}, [getState]);

  return (
    <div className="w-dvw h-dvh lg:grid  lg:grid-cols-2 ">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          {signInStep !== "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED" ? (
            <>
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Signin</h1>
                <p className="text-balance text-muted-foreground">
                  Enter email(or username) and password below
                </p>
              </div>
              <UserAuthForm />
            </>
          ) : (
            <>
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Change your password
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your new and confirm password
                </p>
              </div>
              <UserNewPasswordForm />
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col content-center lg:block">
        <img src="/graph.jpg" className="hidden lg:block" />
      </div>
    </div>
  );
}
