"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h2 className="text-lg font-semibold">DealerOS AI encountered an error</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {error.message || "An unexpected application error occurred."}
        </p>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </body>
    </html>
  );
}
