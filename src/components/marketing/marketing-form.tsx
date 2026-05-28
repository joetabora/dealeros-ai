import {
  MARKETING_CAMPAIGN_TYPES,
  type MarketingCampaignInput,
} from "@/types/marketing";
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

type MarketingFormProps = {
  defaultValues?: Partial<MarketingCampaignInput>;
  disabled?: boolean;
  className?: string;
};

export function MarketingForm({
  defaultValues,
  disabled = false,
  className,
}: MarketingFormProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="space-y-2">
        <Label htmlFor="dealershipName">Dealership name</Label>
        <Input
          id="dealershipName"
          name="dealershipName"
          placeholder="Milwaukee Harley-Davidson"
          defaultValue={defaultValues?.dealershipName}
          required
          disabled={disabled}
        />
      </div>

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
            {MARKETING_CAMPAIGN_TYPES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventOrOfferName">Event or offer name</Label>
        <Input
          id="eventOrOfferName"
          name="eventOrOfferName"
          placeholder="Summer Bike Night"
          defaultValue={defaultValues?.eventOrOfferName}
          required
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAudience">Target audience</Label>
        <Input
          id="targetAudience"
          name="targetAudience"
          placeholder="Local riders, past buyers, and weekend event regulars"
          defaultValue={defaultValues?.targetAudience}
          required
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaignDate">Campaign date (optional)</Label>
        <Input
          id="campaignDate"
          name="campaignDate"
          type="date"
          defaultValue={defaultValues?.campaignDate}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Live music, test rides, food trucks, and event-only pricing."
          rows={3}
          defaultValue={defaultValues?.description}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
