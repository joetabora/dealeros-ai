"use client";

import { useActionState } from "react";

import {
  type AuthFormState,
  signInAction,
} from "@/lib/auth/actions";
import { LoginSubmitButton } from "@/components/auth/login-submit-button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const initialState: AuthFormState = {};

type LoginFormProps = {
  redirectTo?: string;
  className?: string;
};

export function LoginForm({ redirectTo, className }: LoginFormProps) {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className={cn("space-y-4", className)}>
      {redirectTo ? (
        <input type="hidden" name="redirect" value={redirectTo} />
      ) : null}

      {state.error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Work email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@dealership.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      <LoginSubmitButton />
    </form>
  );
}
