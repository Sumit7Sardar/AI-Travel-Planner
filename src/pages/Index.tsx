import { useState } from "react";
import { flushSync } from "react-dom";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import TravelWizard, { type WizardFormData } from "@/components/TravelWizard";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async (data: WizardFormData) => {
    setError("");
    setItinerary(""); // clear previous result
    setIsLoading(true);

    try {
      const response = await fetch(
        "Insert you webhook URL HERE",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            departureCity: data.departureCity.trim(),
            location: data.destination.trim(),
            dates: data.dates.trim(),
            numberOfPeople: data.numberOfPeople.trim(),
            travelType: data.travelType,
            travelVibe: data.travelVibe,
            budgetLevel: data.budgetLevel,
            pace: data.pace,
            specialRequests: data.specialRequests.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error("Request failed");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamStarted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split(/(?<=\})\s+(?=\{)/);
        buffer = parts.pop() || "";

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed);
            if (
              parsed.type === "item" &&
              parsed.metadata?.nodeName === "AI Agent" &&
              typeof parsed.content === "string"
            ) {
              flushSync(() => {
                if (!streamStarted) {
                  streamStarted = true;
                }
                setItinerary((prev) => prev + parsed.content);
              });
            }
          } catch {
            // Incomplete JSON fragment — will be retried with next chunk
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer.trim());
          if (
            parsed.type === "item" &&
            parsed.metadata?.nodeName === "AI Agent" &&
            typeof parsed.content === "string"
          ) {
            flushSync(() => {
              setItinerary((prev) => prev + parsed.content);
            });
          }
        } catch {
          // ignore malformed trailing chunk
        }
      }
    } catch (err) {
      setError("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setItinerary("");
    setError("");
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
            <TravelWizard onSubmit={handleGenerate} isLoading={isLoading} itinerary={itinerary} />
          </CardContent>
        </Card>

        {/* Error Card */}
        {error && (
          <Card className="shadow-xl border-0 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-destructive font-medium">{error}</p>
              <Button variant="outline" className="gap-2" onClick={handleReset}>
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Show itinerary card as soon as ANY content arrives */}
        {itinerary && (
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
              {/* Only show reset button when streaming is fully done */}
              {!isLoading && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate Another
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
