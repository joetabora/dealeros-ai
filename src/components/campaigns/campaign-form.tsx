"use client";

import {
  CAMPAIGN_PLATFORMS,
  CAMPAIGN_TONES,
  CAMPAIGN_TYPES,
  type CampaignGeneratorInput,
} from "@/types/campaign";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type CampaignFormProps = {
  defaultValues?: Partial<CampaignGeneratorInput>;
  disabled?: boolean;
  className?: string;
};

export function CampaignForm({
  defaultValues,
  disabled = false,
  className,
}: CampaignFormProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="space-y-2">
        <Label htmlFor="dealershipName">Dealership name</Label>
        <Input
          id="dealershipName"
          name="dealershipName"
          placeholder="Metro Harley-Davidson"
          defaultValue={defaultValues?.dealershipName}
          required
          disabled={disabled}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="campaignType">Campaign type</Label>
          <Select
            name="campaignType"
            defaultValue={defaultValues?.campaignType ?? "event"}
            disabled={disabled}
          >
            <SelectTrigger id="campaignType" className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {CAMPAIGN_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Tone</Label>
          <Select
            name="tone"
            defaultValue={defaultValues?.tone ?? "community"}
            disabled={disabled}
          >
            <SelectTrigger id="tone" className="w-full">
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              {CAMPAIGN_TONES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAudience">Target audience</Label>
        <Textarea
          id="targetAudience"
          name="targetAudience"
          placeholder="Past buyers, local riders, service customers who haven't visited in 6+ months..."
          defaultValue={defaultValues?.targetAudience}
          required
          disabled={disabled}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform">Primary platform</Label>
        <Select
          name="platform"
          defaultValue={defaultValues?.platform ?? "facebook"}
          disabled={disabled}
        >
          <SelectTrigger id="platform" className="w-full">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            {CAMPAIGN_PLATFORMS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
