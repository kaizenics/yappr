"use client";

import { ArrowRightIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Highlighter } from "@/components/ui/highlighter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Hero() {
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  return (
    <div>
      <Container variant="fullMobilePadded">
        <div className="flex flex-col items-center justify-center min-h-screen w-full">
          <button onClick={() => setShowAuthDialog(true)}>
            <div
              className={cn(
                "group rounded-full border border-black/5 bg-zinc-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-zinc-200 dark:border-white/5 dark:bg-zinc-900 dark:hover:bg-zinc-800 mb-4"
              )}
            >
              <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-zinc-600 hover:duration-300 dark:hover:text-zinc-400">
                <span className="font-manrope">Join the Public Chat</span>
                <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5 -rotate-45" />
              </AnimatedShinyText>
            </div>
          </button>
          {/* Main title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Start Yapping with{" "}
              <Highlighter action="underline" color="#4ade80">
                Strangers
              </Highlighter>
            </h1>
            <p className="text-muted-foreground text-sm">
              Yappr is a platform for sending and receiving anonymous messages.
            </p>
          </div>

          {/* Join chat input */}
          <div className="w-full max-w-lg space-y-3 mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your name to start yapping"
                className="w-full bg-muted/30 border border-border/30 rounded-full px-6 py-4 pr-16 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              <button
                onClick={() => setShowAuthDialog(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-muted/50 hover:bg-muted/70 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Authentication Dialog */}
          <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Sign In First</DialogTitle>
                <DialogDescription>
                  Choose how you'd like to sign in to start yapping
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 mt-4">
                {/* Google Sign In */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-center"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                {/* GitHub Sign In */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-center"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </Button>

                {/* Facebook Sign In */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-center"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continue with Facebook
                </Button>

                {/* Divider */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                {/* Anonymous/Guest Sign In */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-center"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Continue as Guest
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Container>
    </div>
  );
}
