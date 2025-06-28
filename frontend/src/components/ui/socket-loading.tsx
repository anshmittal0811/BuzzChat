import AnimatedBeeLogo from "@/components/AnimatedBeeLogo";

export const SocketLoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center space-y-6">
        <AnimatedBeeLogo size="lg" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Connecting to BuzzChat</h2>
          <p className="text-muted-foreground">
            Establishing secure connection...
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}; 