"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon } from "lucide-react";

interface MessageInputProps {
  value: string;
  placeholder: string;
  isConnected: boolean;
  attachedImageName: string | null;
  onChange: (value: string) => void;
  onSend: () => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  onAttachImage: (file: File) => void;
}

export function MessageInput({
  value,
  placeholder,
  isConnected,
  attachedImageName,
  onChange,
  onSend,
  onTypingStart,
  onTypingStop,
  onAttachImage,
}: MessageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onTypingStop();
    };
  }, [onTypingStop]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (e.target.value.trim() && isConnected) {
      onTypingStart();
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop();
    }, 2000);
  };

  const handleAttachImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleAttachImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAttachImage(file);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full border border-border/50 bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/50 min-h-[48px] md:min-h-[52px] rounded-2xl px-4 md:px-6 py-3 md:py-4 pr-12 md:pr-14 text-sm shadow-sm"
          disabled={!isConnected}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAttachImageChange}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleAttachImageClick}
          className="absolute right-10 md:right-12 top-1/2 -translate-y-1/2 h-8 w-8 md:h-9 md:w-9 rounded-xl text-muted-foreground"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          onClick={onSend}
          disabled={!value.trim() || !isConnected}
          size="icon"
          className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 h-8 w-8 md:h-9 md:w-9 rounded-xl bg-primary hover:bg-primary/90 shadow-sm transition-all duration-200 ease-in-out hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {attachedImageName && (
        <p className="mt-2 text-xs text-muted-foreground">
          Attached image (static): {attachedImageName}
        </p>
      )}
    </div>
  );
}
