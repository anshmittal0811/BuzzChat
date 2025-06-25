import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {/* Animated 404 SVG */}
        <div className="relative">
          <svg
            className="w-48 h-48 mx-auto animate-bounce"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background circle with pulse animation */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="hsl(var(--primary))"
              fillOpacity="0.1"
              className="animate-pulse"
            />

            {/* 404 Text */}
            <text
              x="100"
              y="85"
              textAnchor="middle"
              className="text-4xl font-bold fill-primary"
              fontSize="40"
            >
              404
            </text>

            {/* Sad face */}
            <circle cx="80" cy="120" r="3" fill="hsl(var(--primary))" />
            <circle cx="120" cy="120" r="3" fill="hsl(var(--primary))" />
            <path
              d="M 80 140 Q 100 130 120 140"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Floating particles */}
            <circle
              cx="50"
              cy="60"
              r="2"
              fill="hsl(var(--primary))"
              fillOpacity="0.6"
              className="animate-ping"
            />
            <circle
              cx="150"
              cy="50"
              r="1.5"
              fill="hsl(var(--primary))"
              fillOpacity="0.4"
              className="animate-ping"
              style={{ animationDelay: "0.5s" }}
            />
            <circle
              cx="170"
              cy="80"
              r="1"
              fill="hsl(var(--primary))"
              fillOpacity="0.3"
              className="animate-ping"
              style={{ animationDelay: "1s" }}
            />
          </svg>
        </div>

        {/* Title and Description */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Oops! Page Not Found
          </h1>
          <p className="text-muted-foreground text-lg">
            The page you&apos;re looking for seems to have wandered off into the
            digital void.
          </p>
          <p className="text-muted-foreground text-sm">
            Don&apos;t worry, even the best explorers sometimes take a wrong
            turn!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button onClick={() => router.push("/")} className="flex-1">
            Go Home
          </Button>
        </div>

        {/* Additional animated elements */}
        <div className="pt-4">
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
