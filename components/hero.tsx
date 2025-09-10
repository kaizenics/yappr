import { ArrowRightIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Highlighter } from "@/components/ui/highlighter";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Hero() {
    return (
        <div>
            <Container variant="fullMobilePadded">
                <div className="flex flex-col items-center justify-center min-h-screen w-full">
                    <Link href="/public">
                        <div
                            className={cn(
                                "group rounded-full border border-black/5 bg-zinc-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-zinc-200 dark:border-white/5 dark:bg-zinc-900 dark:hover:bg-zinc-800 mb-4",
                            )}
                        >
                            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-zinc-600 hover:duration-300 dark:hover:text-zinc-400">
                                <span className="font-manrope">Join the Public Chat</span>
                                <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5 -rotate-45" />
                            </AnimatedShinyText>
                        </div>
                    </Link>
                    {/* Main title */}
                    <div className="text-center space-y-4">

                        <h1 className="text-4xl font-bold text-foreground">
                            Start Yapping with{" "}<Highlighter action="underline" color="#4ade80">Strangers</Highlighter>
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
                            <Link href="/chat" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-muted/50 hover:bg-muted/70 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}   