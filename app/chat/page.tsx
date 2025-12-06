"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, Users } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRealtime } from "@/hooks/useRealtime";
import { useAuth } from "@/components/providers/auth-provider";
import {
  joinMatchQueue,
  leaveMatchQueue,
  getActiveMatch,
  endMatch,
  type Match,
} from "@/lib/matching";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import { TypingIndicator } from "@/app/public/components/typing-indicator";

export default function PublicChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const autoSearch = searchParams.get("autoSearch") === "true";
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [currentChatter, setCurrentChatter] = useState<string>("Searching for a yapper...");
  const [isSearching, setIsSearching] = useState(false);
  const [matchQueueChannel, setMatchQueueChannel] = useState<RealtimeChannel | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNoUsersMessage, setShowNoUsersMessage] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use realtime hook for messaging
  const {
    messages: realtimeMessages,
    isConnected,
    sendMessage: sendRealtimeMessage,
    sendTypingIndicator,
    stopTypingIndicator,
    typingUsers,
  } = useRealtime(currentMatch?.channel_id || "");

  // Load active match on mount
  useEffect(() => {
    if (!user) return;

    const loadActiveMatch = async () => {
      const match = await getActiveMatch(user.id);
      if (match) {
        setCurrentMatch(match);
        const matchedUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        // Fetch matched user info
        const { data: matchedUser } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("id", matchedUserId)
          .single();
        
        if (matchedUser) {
          setCurrentChatter(matchedUser.display_name || matchedUser.username || "Anonymous");
        } else {
          setCurrentChatter("Anonymous");
        }
      } else {
        setCurrentChatter("Searching for a yapper...");
      }
    };

    loadActiveMatch();
  }, [user]);

  const handleSearchNewYapper = useCallback(async () => {
    if (!user) return;

    setIsSearching(true);
    setShowNoUsersMessage(false);
    setSearchStartTime(Date.now());
    setCurrentChatter("Searching for a yapper...");

    // End current match if exists
    if (currentMatch) {
      await endMatch(currentMatch.id);
      setCurrentMatch(null);
    }

    // Leave existing queue if any
    if (matchQueueChannel) {
      await leaveMatchQueue(matchQueueChannel);
      setMatchQueueChannel(null);
    }

    // Get username
    const username =
      user.user_metadata?.display_name ||
      user.email?.split("@")[0] ||
      "User";

    // Join match queue
    try {
      const handleMatchFound = async (matchedUserId: string) => {
        const match = await getActiveMatch(user.id);
        if (match) {
          setCurrentMatch(match);
          setIsSearching(false);
          setShowNoUsersMessage(false);
          setSearchStartTime(null);
          
          if (matchQueueChannel) {
            await leaveMatchQueue(matchQueueChannel);
            setMatchQueueChannel(null);
          }

          const { data: matchedUser } = await supabase
            .from("profiles")
            .select("display_name, username")
            .eq("id", matchedUserId)
            .single();
          
          if (matchedUser) {
            setCurrentChatter(matchedUser.display_name || matchedUser.username || "Anonymous");
          } else {
            setCurrentChatter("Anonymous");
          }
        }
      };

      const queueChannel = await joinMatchQueue(user.id, username, handleMatchFound);
      setMatchQueueChannel(queueChannel);

      // Check for immediate match
      const existingMatch = await getActiveMatch(user.id);
      if (existingMatch) {
        setCurrentMatch(existingMatch);
        setIsSearching(false);
        setShowNoUsersMessage(false);
        setSearchStartTime(null);
        await leaveMatchQueue(queueChannel);
        setMatchQueueChannel(null);

        const matchedUserId = existingMatch.user1_id === user.id ? existingMatch.user2_id : existingMatch.user1_id;
        const { data: matchedUser } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("id", matchedUserId)
          .single();
        
        if (matchedUser) {
          setCurrentChatter(matchedUser.display_name || matchedUser.username || "Anonymous");
        } else {
          setCurrentChatter("Anonymous");
        }
      }
    } catch (error) {
      console.error("Error joining match queue:", error);
      setIsSearching(false);
      setSearchStartTime(null);
    }
  }, [user, currentMatch, matchQueueChannel]);

  // Auto-start search when coming from hero button
  useEffect(() => {
    if (!user || !autoSearch || hasAutoSearched || currentMatch) return;

    // Small delay to ensure component is ready
    const timer = setTimeout(() => {
      setHasAutoSearched(true);
      handleSearchNewYapper();
    }, 500);

    return () => clearTimeout(timer);
  }, [user, autoSearch, hasAutoSearched, currentMatch, handleSearchNewYapper]);

  // Check for no users after 10 seconds of searching
  useEffect(() => {
    if (!isSearching || !matchQueueChannel || !searchStartTime) return;

    const checkForUsers = () => {
      const elapsed = Date.now() - searchStartTime;
      if (elapsed >= 10000) {
        // Check if there are other users in the queue
        const state = matchQueueChannel.presenceState();
        const otherUsers = Object.keys(state).filter((key) => key !== user?.id);
        
        if (otherUsers.length === 0) {
          setShowNoUsersMessage(true);
        } else {
          setShowNoUsersMessage(false);
        }
      }
    };

    // Check immediately and then every second
    checkForUsers();
    const interval = setInterval(checkForUsers, 1000);
    
    return () => clearInterval(interval);
  }, [isSearching, matchQueueChannel, searchStartTime, user]);

  // Listen for new matches via presence
  useEffect(() => {
    if (!user || !matchQueueChannel) return;

    const handleMatchFound = async () => {
      const match = await getActiveMatch(user.id);
      if (match && match.id !== currentMatch?.id) {
        setCurrentMatch(match);
        setIsSearching(false);
        setShowNoUsersMessage(false);
        setSearchStartTime(null);
        
        // Leave queue
        if (matchQueueChannel) {
          await leaveMatchQueue(matchQueueChannel);
          setMatchQueueChannel(null);
        }

        // Fetch matched user info
        const matchedUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        const { data: matchedUser } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("id", matchedUserId)
          .single();
        
        if (matchedUser) {
          setCurrentChatter(matchedUser.display_name || matchedUser.username || "Anonymous");
        } else {
          setCurrentChatter("Anonymous");
        }
      }
    };

    // Poll for matches less frequently to reduce API calls
    // Since matches are created via presence, we don't need to poll every second
    const interval = setInterval(handleMatchFound, 3000);
    return () => clearInterval(interval);
  }, [user, matchQueueChannel, currentMatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [realtimeMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentMatch || !user) return;

    try {
      await sendRealtimeMessage(newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (matchQueueChannel) {
        leaveMatchQueue(matchQueueChannel);
      }
    };
  }, [matchQueueChannel]);

  return (
    <>
      <div className="flex flex-col h-screen">
        {/* Chat Header */}
        <div className="border-b bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 md:px-0 py-4">
            <div className="flex justify-between items-center gap-3">
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-foreground">
                  {currentChatter}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    {isSearching ? (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    ) : currentMatch ? (
                      isConnected ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      ) : (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {isSearching
                      ? "Searching..."
                      : currentMatch
                      ? isConnected
                        ? "Online"
                        : "Disconnected"
                      : "Not connected"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSearching}
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Find a New Yapper
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Search a New Yapper</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to end the current conversation
                        and search for a new yapper to chat with? Your current
                        chat history will be cleared.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSearchNewYapper}>
                        Search New Yapper
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AnimatedThemeToggler />
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* Disconnected Banner */}
            {currentMatch && !isConnected && !isSearching && (
              <div className="max-w-4xl mx-auto mb-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <p className="text-sm text-destructive font-medium">
                    Connection lost. Attempting to reconnect...
                  </p>
                </div>
              </div>
            )}
            {!currentMatch && !isSearching && (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <p className="text-muted-foreground text-center">
                  Click "Find a New Yapper" to start chatting!
                </p>
              </div>
            )}
            {isSearching && (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground mb-2">Searching for available yappers...</p>
                  {showNoUsersMessage && (
                    <p className="text-sm text-muted-foreground/70">
                      There are no online users at the moment. Still searching...
                    </p>
                  )}
                </div>
              </div>
            )}
            {currentMatch && realtimeMessages.length === 0 && !isSearching && (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <p className="text-muted-foreground text-center">
                  You're connected with {currentChatter}. Say hi!
                </p>
              </div>
            )}
            {currentMatch && (
              <div className="max-w-4xl mx-auto">
                {realtimeMessages.length > 0 && (
                  <div className="space-y-6">
                    {realtimeMessages.map((message) => {
                      const isUser = message.user_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex w-full flex-col",
                            isUser ? "items-end" : "items-start"
                          )}
                        >
                          <p
                            className={cn(
                              "text-sm font-semibold mb-2",
                              isUser ? "text-right" : "text-left"
                            )}
                          >
                            {isUser ? "You" : message.username}
                          </p>
                          <div
                            className={cn(
                              "max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
                              "transition-all duration-200 ease-in-out",
                              "animate-in slide-in-from-bottom-2 fade-in duration-300",
                              isUser
                                ? "bg-blue-500 text-white"
                                : "bg-card text-card-foreground border"
                            )}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <p
                              className={cn(
                                "text-xs mt-2 opacity-70",
                                isUser ? "text-right" : "text-left"
                              )}
                            >
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {typingUsers && typingUsers.length > 0 && (
                  <div className="mt-4">
                    <TypingIndicator typingUsers={typingUsers} />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 md:px-0 py-4">
            <div className="relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  if (currentMatch && user) {
                    sendTypingIndicator();
                  }
                }}
                onKeyPress={handleKeyPress}
                onBlur={() => {
                  if (currentMatch && user) {
                    stopTypingIndicator();
                  }
                }}
                placeholder={
                  !currentMatch
                    ? "Find a yapper to start chatting..."
                    : !isConnected
                    ? "Disconnected. Reconnecting..."
                    : "Type your message..."
                }
                disabled={!currentMatch || isSearching || !isConnected}
                className="resize-none border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring min-h-[48px] rounded-2xl px-4 py-3 pr-12 disabled:opacity-50"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !currentMatch || isSearching || !isConnected}
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl transition-all duration-200 ease-in-out hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
