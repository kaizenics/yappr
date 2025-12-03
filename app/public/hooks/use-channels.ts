import { useState, useEffect, useCallback } from "react";
import { fetchChannels, fetchRooms, createChannel, createRoom } from "@/lib/channels";
import { supabase } from "@/lib/supabase";
import type { ChannelWithRooms } from "../types";

export type { ChannelWithRooms } from "../types";

export function useChannels(userId: string | undefined) {
  const [channels, setChannels] = useState<ChannelWithRooms[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadChannelsAndRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const dbChannels = await fetchChannels("general");
      
      const channelsWithRooms: ChannelWithRooms[] = await Promise.all(
        dbChannels.map(async (ch) => {
          const rooms = await fetchRooms(ch.id);
          return {
            id: ch.id,
            name: ch.name,
            type: ch.type as "category",
            rooms: rooms.map((r) => ({
              id: r.id,
              name: r.name,
              type: r.type as "text" | "voice",
            })),
            expanded: true,
          };
        })
      );

      // Create default channel if none exist
      if (channelsWithRooms.length === 0 && userId) {
        try {
          const defaultChannel = await createChannel("Yappr Channel", "general", userId, true);
          if (defaultChannel) {
            const generalRoom = await createRoom("General", defaultChannel.id, "general", userId, "text");
            channelsWithRooms.push({
              id: defaultChannel.id,
              name: defaultChannel.name,
              type: "category",
              rooms: generalRoom ? [
                {
                  id: generalRoom.id,
                  name: generalRoom.name,
                  type: generalRoom.type as "text" | "voice",
                }
              ] : [],
              expanded: true,
            });
          }
        } catch (error) {
          console.error("Error creating default channel:", error);
        }
      }

      setChannels(channelsWithRooms);
      return channelsWithRooms;
    } catch (error) {
      console.error("Error loading channels:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    loadChannelsAndRooms();

    // Subscribe to real-time changes
    const channelSubscription = supabase
      .channel("channels-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "channels",
        },
        async () => {
          const dbChannels = await fetchChannels("general");
          
          setChannels((prevChannels) => {
            const expandedMap = new Map(prevChannels.map((ch) => [ch.id, ch.expanded ?? true]));
            
            Promise.all(
              dbChannels.map(async (ch) => {
                const rooms = await fetchRooms(ch.id);
                return {
                  id: ch.id,
                  name: ch.name,
                  type: ch.type as "category",
                  rooms: rooms.map((r) => ({
                    id: r.id,
                    name: r.name,
                    type: r.type as "text" | "voice",
                  })),
                  expanded: expandedMap.get(ch.id) ?? true,
                };
              })
            ).then((channelsWithRooms) => {
              setChannels(channelsWithRooms);
            });
            
            return prevChannels;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSubscription);
    };
  }, [userId, loadChannelsAndRooms]);

  const toggleChannelExpanded = useCallback((channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId ? { ...ch, expanded: !ch.expanded } : ch
      )
    );
  }, []);

  return {
    channels,
    isLoading,
    toggleChannelExpanded,
    refreshChannels: loadChannelsAndRooms,
  };
}

