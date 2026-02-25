import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCw } from "lucide-react";

const Index = () => {
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [travelType, setTravelType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState("");
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setError("");

    // Validate all fields
    if (!destination.trim() || !dates.trim() || !travelType) {
      setValidationError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://johnsmith7.app.n8n.cloud/webhook/travel-itinerary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            location: destination.trim(),
            dates: dates.trim(),
            travelType: travelType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        setItinerary(json.itinerary || text);
      } catch {
        setItinerary(text);
      }
    } catch (err) {
      setError("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDestination("");
    setDates("");
    setTravelType("");
    setItinerary("");
    setError("");
    setValidationError("");
  };

  const handleRetry = () => {
    setError("");
    handleSubmit(new Event("submit") as unknown as React.FormEvent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Main Form Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold text-card-foreground">
              ✈️ AI Travel Planner
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Let AI create your perfect itinerary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Destination Field */}
              <div className="space-y-2">
                <Label htmlFor="destination" className="text-card-foreground font-medium">
                  Where are you going?
                </Label>
                <Input
                  id="destination"
                  placeholder="e.g., Tokyo, Japan"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="h-12 bg-card border-input"
                  disabled={isLoading}
                />
              </div>

              {/* Dates Field */}
              <div className="space-y-2">
                <Label htmlFor="dates" className="text-card-foreground font-medium">
                  When are you traveling?
                </Label>
                <Input
                  id="dates"
                  placeholder="e.g., March 10-15, 2025"
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                  className="h-12 bg-card border-input"
                  disabled={isLoading}
                />
              </div>

              {/* Travel Type Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="travelType" className="text-card-foreground font-medium">
                  Who are you traveling with?
                </Label>
                <Select
                  value={travelType}
                  onValueChange={setTravelType}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-12 bg-card border-input">
                    <SelectValue placeholder="Select travel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solo">Solo</SelectItem>
                    <SelectItem value="Couple">Couple</SelectItem>
                    <SelectItem value="Friends">Friends</SelectItem>
                    <SelectItem value="Family">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Validation Error */}
              {validationError && (
                <p className="text-destructive text-sm font-medium text-center">
                  {validationError}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating your itinerary...
                  </>
                ) : (
                  "Generate My Itinerary ✨"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Card */}
        {error && (
          <Card className="shadow-xl border-0 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-destructive font-medium">{error}</p>
              <Button
                onClick={handleRetry}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Itinerary Display Card */}
        {itinerary && !error && (
          <Card className="shadow-xl border-0 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-card-foreground">
                Your Personalized Itinerary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none text-card-foreground">
                <ReactMarkdown>{itinerary}</ReactMarkdown>
              </div>
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Generate Another
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
