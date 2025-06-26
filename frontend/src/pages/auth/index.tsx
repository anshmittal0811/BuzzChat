"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Register from "./components/register";
import Login from "./components/login";

// Animated Bee Logo Component
const AnimatedBeeLogo = () => {
  return (
    <div className="relative inline-block">
      <div className="bee-container">
        <div className="bee-body">
          {/* Bee body */}
          <div className="w-8 h-12 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full relative">
            {/* Black stripes */}
            <div className="absolute top-2 left-0 right-0 h-1.5 bg-black rounded-full"></div>
            <div className="absolute top-5 left-0 right-0 h-1.5 bg-black rounded-full"></div>
            <div className="absolute top-8 left-0 right-0 h-1.5 bg-black rounded-full"></div>
          </div>
          
          {/* Wings */}
          <div className="bee-wings absolute -top-1 left-1/2 transform -translate-x-1/2">
            <div className="wing-left absolute -left-3 w-4 h-6 bg-white/60 rounded-full transform -rotate-12 animate-flutter"></div>
            <div className="wing-right absolute -right-3 w-4 h-6 bg-white/60 rounded-full transform rotate-12 animate-flutter-reverse"></div>
          </div>
          
          {/* Antennae */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-0.5 h-3 bg-black rotate-12 absolute -left-1"></div>
            <div className="w-0.5 h-3 bg-black -rotate-12 absolute left-1"></div>
            <div className="w-1 h-1 bg-black rounded-full absolute -left-1 -top-1"></div>
            <div className="w-1 h-1 bg-black rounded-full absolute left-1 -top-1"></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .bee-container {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes flutter {
          0%, 100% { transform: rotate(-12deg) scaleY(1); }
          50% { transform: rotate(-25deg) scaleY(0.8); }
        }
        
        @keyframes flutter-reverse {
          0%, 100% { transform: rotate(12deg) scaleY(1); }
          50% { transform: rotate(25deg) scaleY(0.8); }
        }
        
        .animate-flutter {
          animation: flutter 0.3s ease-in-out infinite;
        }
        
        .animate-flutter-reverse {
          animation: flutter-reverse 0.3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const Auth = () => {
  return (
    <div className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-2 bg-background">
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <AnimatedBeeLogo />
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Sign in to your account or create a new one.
            </h1>
          </div>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Login />
            </TabsContent>
            <TabsContent value="register">
              <Register />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="relative hidden lg:block bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-12 pt-24 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AnimatedBeeLogo />
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-black mb-2">
                BuzzChat
              </h2>
              <p className="text-lg text-black/80 font-medium">
                <i>Where Conversations Buzz to Life</i>
              </p>
            </div>
          </div>
        </div>
        
        {/* Floating hexagon pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hexagon-float absolute top-20 left-10 w-6 h-6 bg-black/10 transform rotate-45"></div>
          <div className="hexagon-float absolute top-40 right-20 w-4 h-4 bg-black/10 transform rotate-45" style={{animationDelay: '1s'}}></div>
          <div className="hexagon-float absolute top-60 left-1/3 w-5 h-5 bg-black/10 transform rotate-45" style={{animationDelay: '2s'}}></div>
          <div className="hexagon-float absolute bottom-40 right-10 w-6 h-6 bg-black/10 transform rotate-45" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        <style jsx>{`
          .hexagon-float {
            animation: hexagonFloat 6s ease-in-out infinite;
          }
          
          @keyframes hexagonFloat {
            0%, 100% { transform: rotate(45deg) translateY(0px); opacity: 0.3; }
            25% { transform: rotate(45deg) translateY(-20px); opacity: 0.6; }
            50% { transform: rotate(45deg) translateY(-40px); opacity: 0.3; }
            75% { transform: rotate(45deg) translateY(-20px); opacity: 0.6; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Auth;
