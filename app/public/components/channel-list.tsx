"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, ChevronRight, Hash } from "lucide-react";
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
import type { ChannelWithRooms, Room } from "../types";

interface ChannelListProps {
  channels: ChannelWithRooms[];
  selectedRoomId: string;
  isLoading: boolean;
  isSuperAdmin: boolean;
  onRoomSelect: (roomId: string) => void;
  onChannelToggle: (channelId: string) => void;
  onChannelDelete: (channelId: string) => void;
  onRoomDelete: (roomId: string, parentId: string) => void;
  onSidebarClose: () => void;
}

export function ChannelList({
  channels,
  selectedRoomId,
  isLoading,
  isSuperAdmin,
  onRoomSelect,
  onChannelToggle,
  onChannelDelete,
  onRoomDelete,
  onSidebarClose,
}: ChannelListProps) {
  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground px-3 py-2">Loading...</div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="text-xs text-muted-foreground px-3 py-2">No channels yet</div>
    );
  }

  return (
    <>
      {channels.map((channel) => (
        <div key={channel.id} className="space-y-0.5">
          {/* Parent Channel Header */}
          <div className="group relative">
            <button
              onClick={() => onChannelToggle(channel.id)}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200 shrink-0",
                  channel.expanded ? "rotate-90" : ""
                )}
              />
              <span className="truncate">{channel.name}</span>
              <span className="text-[10px] text-muted-foreground/60 ml-auto">
                {channel.rooms.length}
              </span>
            </button>
            {isSuperAdmin && (
              <DeleteChannelButton
                channelName={channel.name}
                onDelete={() => onChannelDelete(channel.id)}
              />
            )}
          </div>

          {/* Rooms (Children) */}
          {channel.expanded && (
            <div className="ml-5 space-y-0.5">
              {channel.rooms.map((room) => (
                <RoomItem
                  key={room.id}
                  room={room}
                  isSelected={selectedRoomId === room.id}
                  isSuperAdmin={isSuperAdmin}
                  onSelect={() => {
                    onRoomSelect(room.id);
                    onSidebarClose();
                  }}
                  onDelete={() => onRoomDelete(room.id, channel.id)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

interface RoomItemProps {
  room: Room;
  isSelected: boolean;
  isSuperAdmin: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function RoomItem({ room, isSelected, isSuperAdmin, onSelect, onDelete }: RoomItemProps) {
  return (
    <div
      className={cn(
        "group/room relative flex items-center rounded-md transition-colors",
        isSelected
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <button
        onClick={onSelect}
        className="flex-1 flex items-center gap-2 px-2 py-1.5 text-left"
      >
        <Hash className="h-3.5 w-3.5 shrink-0 opacity-60" />
        <span className="text-xs truncate flex-1">{room.name}</span>
        {room.unread && (
          <span className="bg-primary text-primary-foreground text-[10px] font-medium rounded-full min-w-[16px] h-4 flex items-center justify-center px-1.5 shrink-0">
            {room.unread}
          </span>
        )}
      </button>
      {isSuperAdmin && room.name.toLowerCase() !== "general" && (
        <DeleteRoomButton roomName={room.name} onDelete={onDelete} />
      )}
    </div>
  );
}

interface DeleteChannelButtonProps {
  channelName: string;
  onDelete: () => void;
}

function DeleteChannelButton({ channelName, onDelete }: DeleteChannelButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Channel</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{channelName}" and all its rooms? This action cannot be undone and all messages will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface DeleteRoomButtonProps {
  roomName: string;
  onDelete: () => void;
}

function DeleteRoomButton({ roomName, onDelete }: DeleteRoomButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 h-6 w-6 opacity-0 group-hover/room:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Room</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{roomName}"? This action cannot be undone and all messages in this room will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
