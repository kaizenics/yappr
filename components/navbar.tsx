"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Menu, X } from "lucide-react";
import Image from "next/image";

interface NavbarProps {
    sidebarOpen?: boolean;
    onSidebarToggle?: () => void;
    serverName?: string;
    channelName?: string;
    onlineUsersCount?: number;
    showMobileMenu?: boolean;
}

export function Navbar({ 
    sidebarOpen = false, 
    onSidebarToggle, 
    serverName, 
    channelName, 
    onlineUsersCount = 0,
    showMobileMenu = false 
}: NavbarProps) {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-sm border-b z-50 flex items-center px-4 md:px-6">
            <div className="flex items-center gap-2 md:gap-3">
                {showMobileMenu && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden h-8 w-8"
                        onClick={onSidebarToggle}
                    >
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                )}
                <Link href="/">
                    <Image 
                        src="/icon.png" 
                        alt="Yappr" 
                        width={42} 
                        height={42}
                        className="filter dark:invert transition-all duration-200"
                    />
                </Link>
                {serverName && (
                    <>
                        <div className="h-6 w-px bg-border hidden sm:block"></div>
                        <h1 className="font-semibold text-foreground hidden sm:block">{serverName}</h1>
                        {channelName && (
                            <span className="text-sm text-muted-foreground hidden md:block">• {channelName}</span>
                        )}
                    </>
                )}
            </div>
            <div className="ml-auto flex items-center gap-2 md:gap-3">
                {onlineUsersCount > 0 && (
                    <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="hidden md:inline">{onlineUsersCount} yappers online</span>
                        <span className="md:hidden">{onlineUsersCount}</span>
                    </div>
                )}
                <AnimatedThemeToggler />
            </div>
        </header>
    )
}