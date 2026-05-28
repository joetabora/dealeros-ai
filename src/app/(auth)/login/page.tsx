import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  const { redirect: redirectTo, error } = await searchParams;

  return (
    <Card className="border-border/60 bg-card/60 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>
          Access your {siteConfig.name} command center.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}
        <LoginForm redirectTo={redirectTo} />
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        <span>
          Need access?{" "}
          <Link href="#" className="text-primary hover:underline">
            Contact your admin
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}
