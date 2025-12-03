"use client";

import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChannelList } from "./channel-list";
import { AddChannelRoomDialog } from "./add-channel-room-dialog";
import type { ChannelWithRooms } from "../types";

interface ChannelSidebarProps {
  channels: ChannelWithRooms[];
  selectedRoomId: string;
  isLoading: boolean;
  isSuperAdmin: boolean;
  sidebarOpen: boolean;
  onRoomSelect: (roomId: string) => void;
  onChannelToggle: (channelId: string) => void;
  onChannelDelete: (channelId: string) => void;
  onRoomDelete: (roomId: string, parentId: string) => void;
  onSidebarClose: () => void;
  onAddChannel: (name: string) => Promise<void>;
  onAddRoom: (name: string, parentId: string) => Promise<void>;
}

export function ChannelSidebar({
  channels,
  selectedRoomId,
  isLoading,
  isSuperAdmin,
  sidebarOpen,
  onRoomSelect,
  onChannelToggle,
  onChannelDelete,
  onRoomDelete,
  onSidebarClose,
  onAddChannel,
  onAddRoom,
}: ChannelSidebarProps) {
  const totalRooms = channels.reduce((sum, ch) => sum + ch.rooms.length, 0);

  return (
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
              {totalRooms} rooms
            </div>
          </div>
        </div>
      </div>

      {/* Channels and Rooms */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          <ChannelList
            channels={channels}
            selectedRoomId={selectedRoomId}
            isLoading={isLoading}
            isSuperAdmin={isSuperAdmin}
            onRoomSelect={onRoomSelect}
            onChannelToggle={onChannelToggle}
            onChannelDelete={onChannelDelete}
            onRoomDelete={onRoomDelete}
            onSidebarClose={onSidebarClose}
          />
        </div>

        {isSuperAdmin && (
          <div className="mt-2 p-2 border-t">
            <AddChannelRoomDialog
              channels={channels.map((ch) => ({ id: ch.id, name: ch.name }))}
              onAddChannel={onAddChannel}
              onAddRoom={onAddRoom}
            />
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-3 md:p-4 border-t bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-linear-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-primary-foreground text-sm font-semibold">
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
            className="h-8 w-8 text-muted-foreground shrink-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

