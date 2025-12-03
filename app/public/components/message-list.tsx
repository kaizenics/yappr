"use client";

import { useEffect, useRef } from "react";
import { TypingIndicator } from "./typing-indicator";
import type { RealtimeMessage, TypingUser } from "@/hooks/useRealtime";

interface MessageListProps {
  messages: RealtimeMessage[];
  typingUsers: TypingUser[];
}

const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export function MessageList({ messages, typingUsers }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  return (
    <div className="h-full overflow-y-auto px-3 md:px-6 py-4 md:py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="space-y-4 md:space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className="flex gap-3 md:gap-4 hover:bg-muted/20 px-2 md:px-4 py-2 rounded-xl transition-colors"
          >
            <div className="w-9 h-9 md:w-11 md:h-11 bg-linear-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0 shadow-sm">
              {message.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 md:gap-3 mb-1">
                <span className="font-semibold text-foreground">
                  {message.username}
                </span>
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  {formatTime(message.created_at)}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap wrap-break-word">
                {message.content}
              </p>
            </div>
          </div>
        ))}
        <TypingIndicator typingUsers={typingUsers} />
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
