"use client";

import { useState, useRef, useEffect } from "react";
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

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  name: string;
}

export default function PublicChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! Welcome to Yappr. How can I help you today?",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isUser: false,
      name: "Yappr AI",
    },
    {
      id: "2",
      content: "Hi there! I'm excited to try out this chat interface.",
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      isUser: true,
      name: "You",
    },
    {
      id: "3",
      content:
        "That's great! Feel free to ask me anything or just have a conversation. I'm here to help!",
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      isUser: false,
      name: "Yappr AI",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [currentChatter, setCurrentChatter] = useState("Yappr AI");
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      isUser: true,
      name: "You",
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    // Simulate response from current yapper after a short delay
    setTimeout(() => {
      const responses = [
        "That's interesting! Tell me more.",
        "I see what you mean. What do you think about that?",
        "Thanks for sharing! How was your day?",
        "Cool! I was just thinking about something similar.",
        "Nice to meet you! Where are you from?",
        "That sounds great! What are your hobbies?",
        "Awesome! I love chatting with new people.",
      ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const yapperMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        timestamp: new Date(),
        isUser: false,
        name: currentChatter,
      };
      setMessages((prev) => [...prev, yapperMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleSearchNewYapper = () => {
    setIsSearching(true);

    // Simulate searching for a new yapper
    setTimeout(() => {
      const randomYappers = [
        "Alex_2024",
        "YapLover99",
        "Anonymous_User",
        "FriendlyStranger",
        "TalkativeToday",
        "RandomYapper",
        "CoolPerson123",
      ];

      const newYapper =
        randomYappers[Math.floor(Math.random() * randomYappers.length)];
      setCurrentChatter(newYapper);

      // Clear previous messages and start fresh
      setMessages([
        {
          id: "welcome",
          content: `Hello! You're now connected with ${newYapper}. Say hi!`,
          timestamp: new Date(),
          isUser: false,
          name: "System",
        },
      ]);

      setIsSearching(false);
    }, 2000); // 2 second delay to simulate searching
  };

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
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {isSearching ? "Searching..." : "Online"}
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
                      New Yapper
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
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full flex-col",
                    message.isUser ? "items-end" : "items-start"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-semibold mb-2",
                      message.isUser ? "text-right" : "text-left"
                    )}
                  >
                    {message.name}
                  </p>
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
                      "transition-all duration-200 ease-in-out",
                      "animate-in slide-in-from-bottom-2 fade-in duration-300",
                      message.isUser
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
                        message.isUser ? "text-right" : "text-left"
                      )}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 md:px-0 py-4">
            <div className="relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="resize-none border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring min-h-[48px] rounded-2xl px-4 py-3 pr-12"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
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
