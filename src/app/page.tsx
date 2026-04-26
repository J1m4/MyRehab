import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dumbbell, ShieldCheck, Zap, Smartphone } from "lucide-react";
import Logo from "@/components/ui/logo";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <Logo />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
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
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-900 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Better Recovery, <br /> Together.
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-400 md:text-xl">
                  Connecting physical therapists and clients for personalized, data-driven recovery.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-200">
                  <Link href="/signup">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-slate-900">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container px-4 md:px-6">
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
