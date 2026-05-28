import Link from "next/link";

import { signInAction } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/config/site";

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect: redirectTo } = await searchParams;

  return (
    <Card className="border-border/60 bg-card/60 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>
          Access your {siteConfig.name} command center.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signInAction} className="space-y-4">
          {redirectTo ? (
            <input type="hidden" name="redirect" value={redirectTo} />
          ) : null}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Work email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@dealership.com"
              defaultValue="jordan@metroautogroup.com"
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
              placeholder="••••••••"
              defaultValue="demo-password"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Continue to dashboard
          </Button>
        </form>
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
