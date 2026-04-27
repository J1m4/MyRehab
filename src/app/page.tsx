"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dumbbell, ShieldCheck, Zap, X, Smartphone, Share } from "lucide-react";
import Logo from "@/components/ui/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const images = [
  "/dashboardpic1.png",
  "/dashboardpic2.png",
  "/dashboardpic3.png",
  "/dashboardpic4.png",
];

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPwaCard, setShowPwaCard] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = localStorage.getItem("pwa-tutorial-dismissed");
    if (!dismissed) {
      setShowPwaCard(true);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const dismissPwaCard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem("pwa-tutorial-dismissed", "true");
    setShowPwaCard(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white">
        <Link className="flex items-center justify-center" href="/">
          <Logo />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Button asChild variant="outline" className="text-slate-900 bg-white border-slate-200 hover:bg-slate-100">
            <Link href="/login">Login</Link>
          </Button>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/signup">
            Sign Up
          </Link>
        </nav>
      </header>
      <div className="flex justify-center py-4 bg-slate-50 border-b lg:hidden">
        <Button asChild variant="ghost" className="text-slate-600">
          <Link href="/login">Already have an account? Sign In</Link>
        </Button>
      </div>
      <main className="flex-1">
        {mounted && showPwaCard && (
          <div className="bg-slate-900 px-4 py-6 border-b">
            <Card className="max-w-md mx-auto bg-slate-800 text-white relative overflow-hidden border-slate-700 shadow-xl">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-2 text-slate-400 hover:text-white hover:bg-slate-700 z-50"
                onClick={dismissPwaCard}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-lg">Add to Home Screen</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300">
                  For the best experience, add MyRehab to your home screen!
                </p>
                <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                  <div className="bg-slate-700 p-2 rounded shrink-0">
                    <Share className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-sm">
                    Tap the <span className="font-bold text-white">Share icon</span> (square with an up arrow) in your browser, then tap <span className="font-bold text-white">&apos;Add to Home Screen&apos;</span>.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden min-h-[600px] flex items-center">
          {/* Slideshow Background */}
          {images.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ))}
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50 z-10" />
          
          <div className="container relative z-20 px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                  Better Recovery, <br /> Together.
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-200 md:text-xl">
                  Connecting physical therapists and clients for personalized, data-driven recovery.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-200 border-none">
                  <Link href="/signup">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-slate-900 bg-transparent">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-white shadow-sm">
                <ShieldCheck className="h-10 w-10 text-slate-900" />
                <h3 className="text-xl font-bold">Secure Tracking</h3>
                <p className="text-sm text-slate-500 text-center">
                  Your recovery data is encrypted and shared only with your therapist.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-white shadow-sm">
                <Zap className="h-10 w-10 text-slate-900" />
                <h3 className="text-xl font-bold">AI-Powered Insights</h3>
                <p className="text-sm text-slate-500 text-center">
                  Get instant feedback analysis to help your therapist optimize your plan.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-white shadow-sm">
                <Dumbbell className="h-10 w-10 text-slate-900" />
                <h3 className="text-xl font-bold">Mobile-First PWA</h3>
                <p className="text-sm text-slate-500 text-center">
                  Access your workouts anywhere, even offline, with our native-like web app.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-slate-500">© 2026 MyRehab Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
