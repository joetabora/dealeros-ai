import { CLOSE_NOW_OPTIONS } from "@/config/closing-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CloseNowFlow() {
  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader>
        <CardTitle>What happens next?</CardTitle>
        <CardDescription>
          Three clear paths. Pick one on the call and move toward the close.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {CLOSE_NOW_OPTIONS.map((option) => (
            <div
              key={option.id}
              className="flex flex-col rounded-xl border border-border/60 bg-background/40 p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <h3 className="font-semibold">{option.title}</h3>
                {option.badge ? (
                  <Badge className="bg-primary/15 text-primary">{option.badge}</Badge>
                ) : null}
              </div>
              <p className="flex-1 text-sm leading-6 text-muted-foreground">
                {option.description}
              </p>
              <Button type="button" variant="secondary" className="mt-4 w-full">
                {option.cta}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
