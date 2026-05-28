"use client";

import { CopyButton } from "@/components/campaigns/copy-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { FullMarketingCampaignOutput } from "@/types/marketing";

type MarketingResultsProps = {
  outputs: FullMarketingCampaignOutput;
  onChange?: (outputs: FullMarketingCampaignOutput) => void;
  editable?: boolean;
};

type ContentCardProps = {
  title: string;
  description?: string;
  value: string;
  badge?: string;
  editable?: boolean;
  onChange?: (value: string) => void;
};

function ContentCard({
  title,
  description,
  value,
  badge,
  editable = false,
  onChange,
}: ContentCardProps) {
  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="space-y-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
        </div>
        <CopyButton value={value} />
      </CardHeader>
      <CardContent>
        {editable && onChange ? (
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={6}
          />
        ) : (
          <div className="rounded-xl border border-border/50 bg-background/40 p-4 text-sm leading-6 whitespace-pre-wrap">
            {value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MarketingResults({
  outputs,
  onChange,
  editable = false,
}: MarketingResultsProps) {
  function updateOutputs(next: FullMarketingCampaignOutput) {
    onChange?.(next);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Event / Offer Strategy
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ContentCard
            title="Campaign positioning"
            badge={`Urgency: ${outputs.strategy.urgencyLevel}`}
            value={outputs.strategy.positioning}
          />
          <ContentCard
            title="Suggested angle"
            value={outputs.strategy.suggestedAngle}
          />
          <ContentCard
            title="Audience targeting logic"
            value={outputs.strategy.audienceTargeting}
            editable={editable}
            onChange={
              editable
                ? (value) =>
                    updateOutputs({
                      ...outputs,
                      strategy: { ...outputs.strategy, audienceTargeting: value },
                    })
                : undefined
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Social Media</h2>
        <div className="grid gap-4">
          {outputs.socialMedia.facebookPosts.map((post, index) => (
            <ContentCard
              key={`fb-${index}`}
              title={`Facebook Post ${index + 1}`}
              badge="Facebook"
              description={
                index === 0
                  ? "Launch hype — post 7+ days out"
                  : index === 1
                    ? "Mid-cycle push — 3 days out"
                    : "Final urgency — 1 day out"
              }
              value={post}
              editable={editable}
              onChange={
                editable
                  ? (value) => {
                      const facebookPosts = [...outputs.socialMedia.facebookPosts] as [
                        string,
                        string,
                        string,
                      ];
                      facebookPosts[index] = value;
                      updateOutputs({
                        ...outputs,
                        socialMedia: { ...outputs.socialMedia, facebookPosts },
                      });
                    }
                  : undefined
              }
            />
          ))}
          {outputs.socialMedia.instagramCaptions.map((caption, index) => (
            <ContentCard
              key={`ig-${index}`}
              title={`Instagram Caption ${index + 1}`}
              badge="Instagram"
              value={caption}
              editable={editable}
              onChange={
                editable
                  ? (value) => {
                      const instagramCaptions = [
                        ...outputs.socialMedia.instagramCaptions,
                      ] as [string, string, string];
                      instagramCaptions[index] = value;
                      updateOutputs({
                        ...outputs,
                        socialMedia: { ...outputs.socialMedia, instagramCaptions },
                      });
                    }
                  : undefined
              }
            />
          ))}
          <ContentCard
            title="Reel / Script idea"
            badge="Instagram Reel"
            value={outputs.socialMedia.reelScript}
            editable={editable}
            onChange={
              editable
                ? (value) =>
                    updateOutputs({
                      ...outputs,
                      socialMedia: { ...outputs.socialMedia, reelScript: value },
                    })
                : undefined
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">SMS Campaign</h2>
        <div className="grid gap-4">
          <ContentCard title="Announcement message" badge="SMS" value={outputs.sms.announcement} />
          <ContentCard title="Reminder message" badge="SMS" value={outputs.sms.reminder} />
          <ContentCard title="Final urgency message" badge="SMS" value={outputs.sms.finalUrgency} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Email Campaign</h2>
        <div className="grid gap-4">
          {outputs.email.subjectLines.map((subject, index) => (
            <ContentCard
              key={`subject-${index}`}
              title={`Subject line ${index + 1}`}
              badge="Email"
              value={subject}
            />
          ))}
          <ContentCard title="Email body" badge="Email" value={outputs.email.body} />
          <ContentCard title="CTA section" badge="Email" value={outputs.email.ctaSection} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Timeline Engine</h2>
        <div className="grid gap-4">
          {outputs.timeline.map((item) => (
            <ContentCard
              key={item.id}
              title={`${item.timing} — ${item.label}`}
              badge={item.platform}
              value={item.content}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Revenue Injection Layer
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ContentCard title="Service upsell angle" value={outputs.revenueLayer.serviceUpsell} />
          <ContentCard title="Sales CTA" value={outputs.revenueLayer.salesCta} />
          {outputs.revenueLayer.testRideCta ? (
            <ContentCard title="Test ride CTA" value={outputs.revenueLayer.testRideCta} />
          ) : null}
          <ContentCard title="Inventory mention" value={outputs.revenueLayer.inventoryMention} />
        </div>
      </section>

      {outputs.leadCaptureLayer ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Lead Capture Layer
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <ContentCard
              title="Primary CTA"
              badge="Lead tracking"
              value={outputs.leadCaptureLayer.primaryCta}
            />
            <ContentCard
              title="Conversion potential"
              badge={`Score ${outputs.leadCaptureLayer.conversionPotentialScore}`}
              value={`Estimated ${outputs.leadCaptureLayer.estimatedLeads} leads from this campaign. Every CTA interaction creates a structured lead in your pipeline.`}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {outputs.leadCaptureLayer.trackingTriggers.map((trigger, index) => (
              <ContentCard
                key={`cta-${index}`}
                title={`Tracking trigger ${index + 1}`}
                badge="Capturable CTA"
                value={trigger}
              />
            ))}
          </div>
          <ContentCard
            title="SMS response keywords"
            badge="Auto-capture"
            value={outputs.leadCaptureLayer.smsKeywords.join(" · ")}
          />
        </section>
      ) : null}
    </div>
  );
}

export function MarketingResultsEmpty() {
  return (
    <Card className="border-dashed border-border/70 bg-card/20">
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-lg font-medium">Your full marketing campaign appears here</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Enter one idea — get strategy, social posts, SMS, email, timeline, and
          revenue CTAs in one click.
        </p>
      </CardContent>
    </Card>
  );
}
