"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useRealtime } from "@/hooks/useRealtime";
import { useAuth } from "@/components/providers/auth-provider";
import { createChannel, createRoom, deleteChannel, deleteRoom } from "@/lib/channels";
import { ChannelSidebar } from "./components/channel-sidebar";
import { MessageList } from "./components/message-list";
import { MessageInput } from "./components/message-input";
import { ActiveUsersSidebar } from "./components/active-users-sidebar";
import { useChannels } from "./hooks/use-channels";

export default function PublicChatPage() {
  const { user } = useAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("general");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [attachedImageName, setAttachedImageName] = useState<string | null>(null);

  const { channels, isLoading: isLoadingChannels, toggleChannelExpanded } = useChannels(user?.id);

  const {
    messages,
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
    stopTypingIndicator,
  } = useRealtime(selectedRoomId);

  // Auto-select first room if current selection is invalid
  useEffect(() => {
    if (!isLoadingChannels && channels.length > 0) {
      const isValidRoom = channels.some((ch) =>
        ch.rooms.some((r) => r.id === selectedRoomId)
      );

      if (!isValidRoom) {
        const firstRoom =
          channels
            .flatMap((ch) => ch.rooms)
            .find((r) => r.id === "general") ||
          channels.flatMap((ch) => ch.rooms)[0];
        if (firstRoom) {
          setSelectedRoomId(firstRoom.id);
        }
      }
    }
  }, [channels, selectedRoomId, isLoadingChannels]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await sendMessage(newMessage);
      setNewMessage("");
      setAttachedImageName(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleAttachImage = (file: File) => {
    setAttachedImageName(file.name);
  };

  const currentRoom = channels
    .flatMap((ch) => ch.rooms)
    .find((r) => r.id === selectedRoomId);

  const currentChannel = channels.find((ch) =>
    ch.rooms.some((r) => r.id === selectedRoomId)
  );

  const isSuperAdmin = Boolean(
    user?.email &&
    process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL &&
    user.email.toLowerCase().trim() ===
      process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL.toLowerCase().trim()
  );

  const handleAddChannel = async (name: string) => {
    if (!user) return;
    try {
      await createChannel(name, "general", user.id, true);
    } catch (error) {
      console.error("Error creating channel:", error);
      throw error;
    }
  };

  const handleAddRoom = async (name: string, parentId: string) => {
    if (!user) return;
    try {
      await createRoom(name, parentId, "general", user.id, "text");
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!user) return;
    try {
      await deleteChannel(channelId, "general");

      // If deleted channel contained selected room, switch to first available room
      const deletedChannel = channels.find((ch) => ch.id === channelId);
      if (deletedChannel?.rooms.some((r) => r.id === selectedRoomId)) {
        const firstRoom = channels
          .filter((ch) => ch.id !== channelId)
          .flatMap((ch) => ch.rooms)[0];
        if (firstRoom) {
          setSelectedRoomId(firstRoom.id);
        }
      }
    } catch (error) {
      console.error("Error deleting channel:", error);
      throw error;
    }
  };

  const handleDeleteRoom = async (roomId: string, parentId: string) => {
    if (!user) return;
    try {
      await deleteRoom(roomId, parentId, "general");

      // If deleted room was selected, switch to first available room
      if (selectedRoomId === roomId) {
        const firstRoom = channels
          .flatMap((ch) => ch.rooms)
          .find((r) => r.id !== roomId);
        if (firstRoom) {
          setSelectedRoomId(firstRoom.id);
        }
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      throw error;
    }
  };

  return (
    <div className="flex h-screen bg-background relative">
      {/* Top Navigation */}
      <Navbar
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        serverName="Yappr Community"
        channelName={currentRoom?.name || currentChannel?.name}
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

      {/* Left Sidebar - Channels and Rooms */}
      <ChannelSidebar
        channels={channels}
        selectedRoomId={selectedRoomId}
        isLoading={isLoadingChannels}
        isSuperAdmin={isSuperAdmin}
        sidebarOpen={sidebarOpen}
        onRoomSelect={setSelectedRoomId}
        onChannelToggle={toggleChannelExpanded}
        onChannelDelete={handleDeleteChannel}
        onRoomDelete={handleDeleteRoom}
        onSidebarClose={() => setSidebarOpen(false)}
        onAddChannel={handleAddChannel}
        onAddRoom={handleAddRoom}
      />

      {/* Main Chat Area */}
      <div className="flex-1 lg:ml-0 flex flex-col pt-16">
        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} typingUsers={typingUsers} />
        </div>

        {/* Message Input */}
        <div className="p-3 md:p-6 border-t bg-background/50">
          <MessageInput
            value={newMessage}
            placeholder={`Share your thoughts with ${currentRoom?.name || "General"}...`}
            isConnected={isConnected}
            attachedImageName={attachedImageName}
            onChange={setNewMessage}
            onSend={handleSendMessage}
            onTypingStart={sendTypingIndicator}
            onTypingStop={stopTypingIndicator}
            onAttachImage={handleAttachImage}
          />
        </div>
      </div>

      {/* Right Sidebar - Active Yappers */}
      <ActiveUsersSidebar onlineUsers={onlineUsers} />
    </div>
  );
}
