"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Channel {
  id: string;
  name: string;
}

interface AddChannelRoomDialogProps {
  channels: Channel[];
  onAddChannel: (name: string) => Promise<void>;
  onAddRoom: (name: string, parentId: string) => Promise<void>;
}

export function AddChannelRoomDialog({
  channels,
  onAddChannel,
  onAddRoom,
}: AddChannelRoomDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [selectedParentForRoom, setSelectedParentForRoom] = useState<string | null>(null);

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setNewChannelName("");
      setNewRoomName("");
      setSelectedParentForRoom(null);
    }
  };

  const handleAddChannel = async () => {
    if (!newChannelName.trim()) return;
    await onAddChannel(newChannelName.trim());
    setNewChannelName("");
  };

  const handleAddRoom = async () => {
    if (!newRoomName.trim() || !selectedParentForRoom) return;
    await onAddRoom(newRoomName.trim(), selectedParentForRoom);
    setNewRoomName("");
    setSelectedParentForRoom(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center gap-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Channel or Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Channel or Room</DialogTitle>
          <DialogDescription>
            Create a new channel or add a room to an existing channel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add Channel Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border"></div>
              <span className="text-xs font-medium text-muted-foreground">New Channel</span>
              <div className="h-px flex-1 bg-border"></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel-name" className="text-sm">
                Channel Name
              </Label>
              <div className="flex gap-2">
                <Input
                  id="channel-name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Enter channel name..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && newChannelName.trim()) {
                      handleAddChannel();
                    }
                  }}
                />
                <Button
                  onClick={handleAddChannel}
                  disabled={!newChannelName.trim()}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Add Room Section */}
          {channels.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs font-medium text-muted-foreground">New Room</span>
                <div className="h-px flex-1 bg-border"></div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-channel" className="text-sm">
                  Parent Channel
                </Label>
                <Select
                  value={selectedParentForRoom || undefined}
                  onValueChange={(value) => setSelectedParentForRoom(value || null)}
                >
                  <SelectTrigger id="room-channel">
                    <SelectValue placeholder="Select a channel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((ch) => (
                      <SelectItem key={ch.id} value={ch.id}>
                        {ch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-name" className="text-sm">
                  Room Name
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="room-name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Enter room name..."
                    className="flex-1"
                    disabled={!selectedParentForRoom}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && newRoomName.trim() && selectedParentForRoom) {
                        handleAddRoom();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddRoom}
                    disabled={!newRoomName.trim() || !selectedParentForRoom}
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {channels.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Create a channel first to add rooms.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
