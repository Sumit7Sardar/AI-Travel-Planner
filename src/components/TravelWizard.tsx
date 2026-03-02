import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const VIBE_OPTIONS = ["Relaxed", "Adventure", "Culture", "Party", "Food", "Nature"] as const;
const BUDGET_OPTIONS = ["Budget", "Mid-range", "Luxury"] as const;
const PACE_OPTIONS = ["Packed", "Balanced", "Slow"] as const;
const TRAVEL_TYPE_OPTIONS = ["Solo", "Couple", "Friends", "Family"] as const;

export interface WizardFormData {
  departureCity: string;
  destination: string;
  dates: string;
  numberOfPeople: string;
  travelType: string;
  travelVibe: string[];
  budgetLevel: string;
  pace: string;
  specialRequests: string;
}

interface TravelWizardProps {
  onSubmit: (data: WizardFormData) => void;
  isLoading: boolean;
  itinerary?: string;
}

const TOTAL_STEPS = 5;

const TravelWizard = ({ onSubmit, isLoading, itinerary = "" }: TravelWizardProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>({
    departureCity: "",
    destination: "",
    dates: "",
    numberOfPeople: "",
    travelType: "",
    travelVibe: [],
    budgetLevel: "",
    pace: "",
    specialRequests: "",
  });
  const [validationError, setValidationError] = useState("");

  const update = (field: keyof WizardFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError("");
  };

  const toggleVibe = (v: string) => {
    setFormData((prev) => ({
      ...prev,
      travelVibe: prev.travelVibe.includes(v)
        ? prev.travelVibe.filter((x) => x !== v)
        : [...prev.travelVibe, v],
    }));
    setValidationError("");
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!formData.departureCity.trim() || !formData.destination.trim()) {
          setValidationError("Please fill in both cities");
          return false;
        }
        return true;
      case 2:
        if (!formData.dates.trim() || !formData.numberOfPeople.trim()) {
          setValidationError("Please fill in dates and number of people");
          return false;
        }
        return true;
      case 3:
        if (!formData.travelType || formData.travelVibe.length === 0) {
          setValidationError("Please select travel type and at least one vibe");
          return false;
        }
        return true;
      case 4:
        if (!formData.budgetLevel || !formData.pace) {
          setValidationError("Please select budget and pace");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setValidationError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const progressPercent = (step / TOTAL_STEPS) * 100;

  const stepLabels = ["Location", "Dates", "Style", "Preferences", "Extras"];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          {stepLabels.map((label, i) => (
            <span
              key={label}
              className={i + 1 <= step ? "text-primary font-semibold" : ""}
            >
              {label}
            </span>
          ))}
        </div>
        <Progress value={progressPercent} className="h-2" />
        <p className="text-xs text-muted-foreground text-center">
          Step {step} of {TOTAL_STEPS}
        </p>
      </div>

      {/* Step content */}
      <div className="space-y-5 min-h-[200px]">
        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="departureCity" className="text-card-foreground font-medium">
                Where are you departing from?
              </Label>
              <Input
                id="departureCity"
                placeholder="e.g., New York, USA"
                value={formData.departureCity}
                onChange={(e) => update("departureCity", e.target.value)}
                className="h-12 bg-card border-input"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination" className="text-card-foreground font-medium">
                Where are you going?
              </Label>
              <Input
                id="destination"
                placeholder="e.g., Tokyo, Japan"
                value={formData.destination}
                onChange={(e) => update("destination", e.target.value)}
                className="h-12 bg-card border-input"
                disabled={isLoading}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="dates" className="text-card-foreground font-medium">
                When are you traveling?
              </Label>
              <Input
                id="dates"
                placeholder="e.g., March 10-15, 2025"
                value={formData.dates}
                onChange={(e) => update("dates", e.target.value)}
                className="h-12 bg-card border-input"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfPeople" className="text-card-foreground font-medium">
                How many people?
              </Label>
              <Input
                id="numberOfPeople"
                type="number"
                min="1"
                placeholder="e.g., 2"
                value={formData.numberOfPeople}
                onChange={(e) => update("numberOfPeople", e.target.value)}
                className="h-12 bg-card border-input"
                disabled={isLoading}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-2">
              <Label className="text-card-foreground font-medium">
                Who are you traveling with?
              </Label>
              <Select
                value={formData.travelType}
                onValueChange={(v) => update("travelType", v)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-12 bg-card border-input">
                  <SelectValue placeholder="Select travel type" />
                </SelectTrigger>
                <SelectContent>
                  {TRAVEL_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground font-medium">
                What's your travel vibe? <span className="text-muted-foreground font-normal">(select all that apply)</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {VIBE_OPTIONS.map((v) => {
                  const selected = formData.travelVibe.includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => toggleVibe(v)}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-card-foreground border-input hover:border-primary/50"
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="space-y-2">
              <Label className="text-card-foreground font-medium">Budget level</Label>
              <div className="flex gap-2">
                {BUDGET_OPTIONS.map((b) => {
                  const selected = formData.budgetLevel === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => update("budgetLevel", b)}
                      disabled={isLoading}
                      className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-card-foreground border-input hover:border-primary/50"
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground font-medium">Travel pace</Label>
              <div className="flex gap-2">
                {PACE_OPTIONS.map((p) => {
                  const selected = formData.pace === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => update("pace", p)}
                      disabled={isLoading}
                      className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-card-foreground border-input hover:border-primary/50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {step === 5 && (
          <div className="space-y-2">
            <Label htmlFor="specialRequests" className="text-card-foreground font-medium">
              Any special requests? <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="specialRequests"
              placeholder="e.g., Vegetarian restaurants, wheelchair accessible, must-see landmarks..."
              value={formData.specialRequests}
              onChange={(e) => update("specialRequests", e.target.value)}
              className="min-h-[120px] bg-card border-input"
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="text-destructive text-sm font-medium text-center">{validationError}</p>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isLoading}
            className="flex-1 h-12 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        {step < TOTAL_STEPS ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="flex-1 h-12 gap-2 bg-primary hover:bg-primary/90"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-colors"
          >
            {isLoading && !itinerary ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Maya is planning your trip...
              </>
            ) : isLoading && itinerary ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Still writing...
              </>
            ) : (
              "Generate My Itinerary ✨"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TravelWizard;
