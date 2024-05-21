import React, { useRef, useState } from "react";
import { Amplify } from "aws-amplify";
import {
  confirmSignIn,
  fetchAuthSession,
  getCurrentUser,
} from "aws-amplify/auth";

import { Icons, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore, useCredentialStore } from "@/store/useAuthStore";
import amplifyConfig from "@/config/amplify";
import { ErrorMessage } from "@/types/types";

interface UserNewPasswordFormProps
  extends React.HTMLAttributes<HTMLDivElement> {}

Amplify.configure({ ...amplifyConfig });
export function UserNewPasswordForm({
  className,
  ...props
}: UserNewPasswordFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const refNewPassword = useRef<HTMLInputElement>(null);
  const refConfirmPassword = useRef<HTMLInputElement>(null);

  const setUser = useAuthStore((state) => state.setUser);
  const setCredential = useCredentialStore((state) => state.setCredential);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  const onSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setIsLoading(true);
    if (!refNewPassword.current?.value) {
      setIsLoading(false);
      return;
    }
    if (!refConfirmPassword.current?.value) {
      setIsLoading(false);
      return;
    }
    if (refNewPassword.current?.value !== refConfirmPassword.current.value) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Sign-in error",
        description: "Not match new and confirm password",
      });
      return;
    }
    const newPassword = refNewPassword.current.value;

    // const username = useAuthStore.getState().user;
    try {
      const result = await confirmSignIn({ challengeResponse: newPassword });
      console.log(result);
      const { credentials } = await fetchAuthSession();
      setCredential(credentials);
      const user = await getCurrentUser();
      setUser(user.username);
      setIsAuthenticated(true);
      setIsLoading(false);
      toast({
        title: "Success",
        description: "Sign-in was successful",
      });
      // router.push("/");
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error as ErrorMessage;
      toast({
        variant: "destructive",
        title: "Sign-in error",
        description: errorMessage.message,
      });
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-2 ">
          <Label className="text-left" htmlFor="email">
            New Password
          </Label>
          <Input
            id="new_password"
            placeholder="New password"
            type="password"
            required={true}
            autoCapitalize="none"
            autoCorrect="off"
            disabled={isLoading}
            ref={refNewPassword}
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-left" htmlFor="confirm_password">
            Confirm New Password
          </Label>
          <Input
            id="confirm_password"
            placeholder="Confirm new password"
            type="password"
            autoCorrect="off"
            required={true}
            disabled={isLoading}
            ref={refConfirmPassword}
          />
        </div>
        <Button disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>
    </div>
  );
}
