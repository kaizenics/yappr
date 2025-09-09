"use client"

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, Hash, Users, Settings, Plus, Volume2, Menu, X } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

interface Message {
    id: string;
    content: string;
    timestamp: Date;
    username: string;
    avatar?: string;
}

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
    const [servers] = useState<Server[]>([
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
                { id: "art", name: "art", type: "text", unread: 2 }
            ]
        }
    ]);

    const [selectedServer, setSelectedServer] = useState("general");
    const [selectedChannel, setSelectedChannel] = useState("general");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: "Welcome to the Yappr Community! 👋",
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            username: "YapperBot",
        },
        {
            id: "2",
            content: "Hey everyone! New to this server, excited to chat with you all!",
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            username: "NewYapper23",
        },
        {
            id: "3",
            content: "Welcome @NewYapper23! Feel free to introduce yourself in the #random channel too",
            timestamp: new Date(Date.now() - 3 * 60 * 1000),
            username: "CommunityMod",
        }
    ]);

    const [newMessage, setNewMessage] = useState("");
    const [onlineUsers] = useState([
        "YapperBot", "NewYapper23", "CommunityMod", "TechGuru", "DesignPro", "GameMaster", "MusicLover"
    ]);
    
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
            username: "You",
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage("");
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

    const currentServer = servers.find(s => s.id === selectedServer);
    const currentChannel = currentServer?.channels.find(c => c.id === selectedChannel);

  return (
        <div className="flex h-screen bg-background relative">
            {/* Top Navigation */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-sm border-b z-50 flex items-center px-4 md:px-6">
                <div className="flex items-center gap-2 md:gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden h-8 w-8"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                    <div className="text-lg md:text-xl font-bold text-primary">Yappr</div>
                    <div className="h-6 w-px bg-border hidden sm:block"></div>
                    <h1 className="font-semibold text-foreground hidden sm:block">{currentServer?.name}</h1>
                    <span className="text-sm text-muted-foreground hidden md:block">• {currentChannel?.name}</span>
                </div>
                <div className="ml-auto flex items-center gap-2 md:gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="hidden md:inline">{onlineUsers.length} yappers online</span>
                        <span className="md:hidden">{onlineUsers.length}</span>
                    </div>
                    <AnimatedThemeToggler />
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Left Sidebar - Rooms */}
            <div className={cn(
                "fixed lg:relative top-16 left-0 h-[calc(100vh-4rem)] w-64 md:w-72 bg-card border-r flex flex-col z-50 transition-transform duration-300 ease-in-out lg:transform-none",
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
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
                                <div className={cn(
                                    "w-6 h-6 rounded flex items-center justify-center text-xs",
                                    selectedChannel === channel.id
                                        ? "bg-primary/20"
                                        : "bg-muted/50"
                                )}>
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
                </div>

                {/* User Profile */}
                <div className="p-3 md:p-4 border-t bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-primary-foreground text-sm font-semibold">
                            Y
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">You</div>
                            <div className="text-xs text-green-500 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                Active now
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground flex-shrink-0">
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
                                <div key={message.id} className="flex gap-3 md:gap-4 hover:bg-muted/20 px-2 md:px-4 py-2 rounded-xl transition-colors">
                                    <div className="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0 shadow-sm">
                                        {message.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2 md:gap-3 mb-1">
                                            <span className="font-semibold text-foreground">{message.username}</span>
                                            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                                {formatTime(message.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
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
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={`Share your thoughts with ${currentChannel?.name}...`}
                                className="w-full border border-border/50 bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/50 min-h-[48px] md:min-h-[52px] rounded-2xl px-4 md:px-6 py-3 md:py-4 pr-12 md:pr-14 text-sm shadow-sm"
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                size="icon"
                                className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 h-8 w-8 md:h-9 md:w-9 rounded-xl bg-primary hover:bg-primary/90 shadow-sm transition-all duration-200 ease-in-out hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Active Yappers */}
            <div className="w-64 bg-card/30 border-l hidden xl:flex flex-col pt-16">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-foreground">
                        Active Yappers
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{onlineUsers.length} online in this room</p>
                </div>
                <div className="flex-1 p-4 space-y-3">
                    {onlineUsers.map((user) => (
                        <div key={user} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="relative">
                                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-sm">
                                    {user.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-foreground">{user}</div>
                                <div className="text-xs text-green-500">Active now</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
  );
}