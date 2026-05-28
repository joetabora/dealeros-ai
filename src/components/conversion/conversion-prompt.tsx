"use client";

import Link from "next/link";
import { Calendar, Rocket, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ConversionPromptProps = {
  variant?: "demo" | "dashboard";
};

export function ConversionPrompt({ variant = "demo" }: ConversionPromptProps) {
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/15 via-card/70 to-card/50">
      <CardHeader className="text-center sm:text-left">
        <CardTitle className="text-xl">
          Want this running for your real dealership?
        </CardTitle>
        <CardDescription className="text-base">
          {variant === "demo"
            ? "You just saw what DealerOS can do. Pick how you want to go live."
            : "You are getting real value. Activate your store to unlock full automation."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button size="lg" className="flex-1" render={<Link href="/dashboard/settings#billing" />}>
          <Rocket />
          Start Free Trial
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="flex-1"
          render={
            <a
              href="https://cal.com"
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <Calendar />
          Book Setup Call
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          render={<Link href="/dashboard/settings#billing" />}
        >
          <Sparkles />
          Activate Full System
        </Button>
      </CardContent>
    </Card>
  );
}
