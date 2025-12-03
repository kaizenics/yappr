"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, Settings, Image as ImageIcon, Plus } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useRealtime } from "@/hooks/useRealtime";
import { useAuth } from "@/components/providers/auth-provider";

interface Channel {
  id: string;
  name: string;
  type: "text" | "voice";
  unread?: number;
}

interface Server {
  id: string;
  name: string;
  avatar: string;
  channels: Channel[];
}

export default function PublicChatPage() {
  const { user } = useAuth();

  const [servers, setServers] = useState<Server[]>([
    {
      id: "general",
      name: "Yappr Community",
      avatar: "YC",
      channels: [
        { id: "general", name: "general", type: "text", unread: 3 },
        { id: "random", name: "random", type: "text" },
        { id: "gaming", name: "gaming", type: "text", unread: 1 },
        { id: "tech", name: "tech", type: "text" },
        { id: "music", name: "music", type: "text" },
        { id: "art", name: "art", type: "text", unread: 2 },
      ],
    },
  ]);

  const [selectedServer, setSelectedServer] = useState("general");
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const channelKey = `${selectedServer}:${selectedChannel}`;
  const [newMessage, setNewMessage] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [attachedImageName, setAttachedImageName] = useState<string | null>(
    null
  );

  const {
    messages,
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
    stopTypingIndicator,
  } = useRealtime(channelKey);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  useEffect(() => {
    // Cleanup typing timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTypingIndicator();
    };
  }, [stopTypingIndicator]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await sendMessage(newMessage);
      setNewMessage("");
      setAttachedImageName(null); // Clear attached image (UI only)
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Clear existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator immediately
    if (e.target.value.trim() && isConnected) {
      sendTypingIndicator();
    }

    // Stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTypingIndicator();
    }, 2000);
  };

  const handleAttachImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleAttachImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Static / non-functional: just show the file name as attached
      setAttachedImageName(file.name);
    }
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const currentServer = servers.find((s) => s.id === selectedServer);
  const currentChannel = currentServer?.channels.find(
    (c) => c.id === selectedChannel
  );

  const isSuperAdmin =
    user?.email &&
    process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL &&
    user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

  const handleAddChannel = () => {
    const name = newChannelName.trim();
    if (!name) return;

    const idBase = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 32);
    const id =
      idBase && !currentServer?.channels.find((c) => c.id === idBase)
        ? idBase
        : `channel-${Date.now()}`;

    setServers((prev) =>
      prev.map((server) =>
        server.id === selectedServer
          ? {
              ...server,
              channels: [
                ...server.channels,
                { id, name, type: "text" as const },
              ],
            }
          : server
      )
    );
    setNewChannelName("");
  };

  return (
    <div className="flex h-screen bg-background relative">
      {/* Top Navigation */}
      <Navbar
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        serverName={currentServer?.name}
        channelName={currentChannel?.name}
        onlineUsersCount={onlineUsers.length}
        showMobileMenu={true}
      />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Rooms */}
      <div
        className={cn(
          "fixed lg:relative top-16 left-0 h-[calc(100vh-4rem)] w-64 md:w-72 bg-card border-r flex flex-col z-50 transition-transform duration-300 ease-in-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Community Header */}
        <div className="p-3 md:p-4 border-b">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              YC
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-primary">Yappr Community</div>
              <div className="text-xs text-muted-foreground">
                {currentServer?.channels.length} rooms
              </div>
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="flex-1 p-3 md:p-4">
          <h3 className="font-medium text-foreground mb-3">Rooms</h3>
          <div className="space-y-1">
            {currentServer?.channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => {
                  setSelectedChannel(channel.id);
                  setSidebarOpen(false); // Close sidebar on mobile when room is selected
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-md text-sm transition-colors",
                  selectedChannel === channel.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded flex items-center justify-center text-xs",
                    selectedChannel === channel.id
                      ? "bg-primary/20"
                      : "bg-muted/50"
                  )}
                >
                  #
                </div>
                <span className="flex-1 text-left">{channel.name}</span>
                {channel.unread && (
                  <div className="bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {channel.unread}
                  </div>
                )}
              </button>
            ))}
          </div>

          {isSuperAdmin && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Super Admin – Add Room
              </p>
              <div className="flex gap-2">
                <Input
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="New room name"
                  className="h-8 text-xs"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleAddChannel}
                  disabled={!newChannelName.trim()}
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Rooms are local-only for now (no persistence yet).
              </p>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="p-3 md:p-4 border-t bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-primary-foreground text-sm font-semibold">
              Y
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                You
              </div>
              <div className="text-xs text-green-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Active now
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground flex-shrink-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 lg:ml-0 flex flex-col pt-16">
        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-3 md:px-6 py-4 md:py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-4 md:space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex gap-3 md:gap-4 hover:bg-muted/20 px-2 md:px-4 py-2 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0 shadow-sm">
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
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              {/* Typing Indicators */}
              {typingUsers.length > 0 && (
                <div className="flex gap-3 md:gap-4 px-2 md:px-4 py-2">
                  <div className="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
                    ...
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground italic">
                      {typingUsers.length === 1
                        ? `${typingUsers[0].username} is typing...`
                        : typingUsers.length === 2
                        ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`
                        : `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`}
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-3 md:p-6 border-t bg-background/50">
          <div className="w-full">
            <div className="relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={`Share your thoughts with ${currentChannel?.name}...`}
                className="w-full border border-border/50 bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/50 min-h-[48px] md:min-h-[52px] rounded-2xl px-4 md:px-6 py-3 md:py-4 pr-12 md:pr-14 text-sm shadow-sm"
                disabled={!isConnected}
              />
              {/* Hidden file input for static image attachment (non-functional backend) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAttachImageChange}
              />
              {/* Attach image button (UI only) */}
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
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isConnected}
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
        </div>
      </div>

      {/* Right Sidebar - Active Yappers */}
      <div className="w-64 bg-card/30 border-l hidden xl:flex flex-col pt-16">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-foreground">Active Yappers</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {onlineUsers.length} online in this room
          </p>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {onlineUsers.map((user) => (
            <div
              key={user}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-sm">
                  {user.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">
                  {user}
                </div>
                <div className="text-xs text-green-500">Active now</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
