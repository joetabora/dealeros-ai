import { EVENT_TYPES } from "@/types/event";
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

type EventFormProps = {
  disabled?: boolean;
  className?: string;
};

export function EventForm({ disabled = false, className }: EventFormProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="space-y-2">
        <Label htmlFor="eventName">Event name</Label>
        <Input
          id="eventName"
          name="eventName"
          placeholder="Summer Bike Night"
          required
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventType">Event type</Label>
        <Select name="eventType" defaultValue="bike_night" disabled={disabled}>
          <SelectTrigger id="eventType" className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventDate">Event date</Label>
        <Input
          id="eventDate"
          name="eventDate"
          type="date"
          required
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Live music, test rides, food trucks, and event-only pricing on select models."
          rows={4}
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
}
