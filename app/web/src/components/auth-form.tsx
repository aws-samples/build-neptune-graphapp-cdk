import React, { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  confirmResetPassword,
  fetchAuthSession,
  getCurrentUser,
  resetPassword,
  signIn,
  signOut,
} from "aws-amplify/auth";
import { Icons, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/types/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore, useCredentialStore } from "@/store/useAuthStore";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState<boolean>(false);

  const refUser = useRef<HTMLInputElement>(null);
  const refPassword = useRef<HTMLInputElement>(null);
  const refEmail = useRef<HTMLInputElement>(null);
  const refCode = useRef<HTMLInputElement>(null);
  const refNewPassword = useRef<HTMLInputElement>(null);

  const [resetEmail, setResetEmail] = useState("");
  const { toast } = useToast();
  const setUser = useAuthStore((state) => state.setUser);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
  const setSignInStep = useAuthStore((state) => state.setSignInStep);
  const setCredential = useCredentialStore((state) => state.setCredential);
  const navigate = useNavigate();
  const onSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setIsLoading(true);
    if (!refUser.current?.value) {
      return;
    }
    if (!refPassword.current?.value) {
      return;
    }

    const username = refUser.current!.value;
    const password = refPassword.current!.value;
    try {
      await signOut({ global: true });

      const { nextStep, isSignedIn } = await signIn({
        username,
        password,
      });

      if (
        nextStep.signInStep !== "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
      ) {
        const { username } = await getCurrentUser();
        setUser(username);
        setIsAuthenticated(isSignedIn);
        setSignInStep(nextStep.signInStep);
        const { credentials } = await fetchAuthSession();
        setCredential(credentials);

        toast({
          title: "Success",
          description: "Sign-in was successful",
        });
        navigate({ to: "/" });
      }
      setUser(username);
      setSignInStep(nextStep.signInStep);
    } catch (error) {
      console.log(error);
      const errorMessage = error as ErrorMessage;
      toast({
        variant: "destructive",
        title: "Sign-in error",
        description: errorMessage.message,
      });
      setIsLoading(false);
    }
  };

  const onSubmitReset = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword({
        username: refEmail.current!.value,
      });
      setIsOpen(!isOpen);
      setIsLoading(false);
      setResetEmail(refEmail.current!.value);
      setIsRecoveryOpen(!isRecoveryOpen);
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error as ErrorMessage;
      toast({
        variant: "destructive",
        title: "Failed to reset password",
        description: errorMessage.message,
      });
    }
  };

  const onSubmitRecovery = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await confirmResetPassword({
        username: resetEmail,
        confirmationCode: refCode.current!.value,
        newPassword: refNewPassword.current!.value,
      });
      setIsRecoveryOpen(!isRecoveryOpen);
      setIsLoading(false);
      toast({
        title: "Reset password successfully",
        description: "Try to sign in with your new password",
      });
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error as ErrorMessage;
      toast({
        variant: "destructive",
        title: "Failed to reset password",
        description: errorMessage.message,
      });
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-2 ">
          <Label htmlFor="email" className="text-left">
            Username/Email
          </Label>
          <Input
            id="user"
            placeholder="Username or your email"
            required={true}
            autoCapitalize="none"
            autoCorrect="off"
            disabled={isLoading}
            ref={refUser}
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-left" htmlFor="password">
            Password
          </Label>
          <Input
            id="password"
            placeholder="Your password"
            type="password"
            autoCorrect="off"
            required={true}
            disabled={isLoading}
            ref={refPassword}
          />
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign in
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or forgot password with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={() => setIsOpen(!isOpen)}
      >
        Reset your password
      </Button>

      {isOpen ? (
        <form onSubmit={onSubmitReset}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                placeholder="sample@example.com"
                type="email"
                required={true}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                ref={refEmail}
              />
            </div>
            <Button disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit
            </Button>
          </div>
        </form>
      ) : (
        <></>
      )}
      {isRecoveryOpen ? (
        <>
          <form onSubmit={onSubmitRecovery}>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="code">
                  Email
                </Label>
                <Input
                  id="code"
                  placeholder="Your code from your email"
                  type="code"
                  required={true}
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isLoading}
                  ref={refCode}
                />
                <Label className="sr-only" htmlFor="new_password">
                  Password
                </Label>
                <Input
                  id="new_password"
                  placeholder="Your new password"
                  type="password"
                  autoCorrect="off"
                  required={true}
                  disabled={isLoading}
                  ref={refNewPassword}
                />
              </div>
              <Button disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit
              </Button>
            </div>
          </form>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
