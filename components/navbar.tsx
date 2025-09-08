"use client"

import Link from "next/link"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export function Navbar() {
    return (
        <header className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
            <div className="mx-auto px-6">
                <div className="flex h-14 items-center justify-between">
                    <div className="flex">
                        <Link href="/" className="font-press-start-2p text-xl text-foreground">
                            Yappr
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <AnimatedThemeToggler />
                    </div>
                </div>
            </div>
        </header>
    )
}