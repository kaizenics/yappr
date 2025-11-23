"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";

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
  showMobileMenu = false,
}: NavbarProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const getUserDisplayName = () => {
    if (!user) return "Guest";
    return (
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User"
    );
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name === "Guest" || name === "User") return "G";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
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
            <h1 className="font-semibold text-foreground hidden sm:block">
              {serverName}
            </h1>
            {channelName && (
              <span className="text-sm text-muted-foreground hidden md:block">
                • {channelName}
              </span>
            )}
          </>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {onlineUsersCount > 0 && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="hidden md:inline">
              {onlineUsersCount} yappers online
            </span>
            <span className="md:hidden">{onlineUsersCount}</span>
          </div>
        )}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none">
                <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                  <AvatarImage
                    src={user.user_metadata?.avatar_url}
                    alt={getUserDisplayName()}
                  />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {getUserDisplayName()}
                  </p>
                  {user.email && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                variant="destructive"
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <AnimatedThemeToggler />
      </div>
    </header>
  );
}
