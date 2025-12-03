import { supabase } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * WebSocket/Realtime utility for real-time messaging
 */

export interface RealtimeMessage {
  id: string;
  content: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  channel_id: string;
  created_at: string;
}

/**
 * Fetch initial messages for a channel
 */
export async function fetchMessages(channelId: string): Promise<RealtimeMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
  return (data as RealtimeMessage[]) || [];
}

/**
 * Subscribe to a channel for real-time messages
 */
export function subscribeToChannel(
  channelId: string,
  callback: (message: RealtimeMessage) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`channel:${channelId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `channel_id=eq.${channelId}`,
      },
      (payload) => {
        callback(payload.new as RealtimeMessage);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to presence (online users)
 */
export async function subscribeToPresence(
  channelId: string,
  onJoin: (userId: string, presence: any) => void,
  onLeave: (userId: string) => void
): Promise<RealtimeChannel> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || "";
  
  const channel = supabase.channel(`presence:${channelId}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      // Handle presence sync
    })
    .on("presence", { event: "join" }, ({ key, newPresences }) => {
      onJoin(key, newPresences[0]);
    })
    .on("presence", { event: "leave" }, ({ key }) => {
      onLeave(key);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await channel.track({
            user_id: user.id,
            username: user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
            online_at: new Date().toISOString(),
          });
        }
      }
    });

  return channel;
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribeFromChannel(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
}

/**
 * Send a message via WebSocket (using Supabase Realtime)
 */
export async function sendRealtimeMessage(
  channelId: string,
  content: string,
  userId: string,
  username: string
): Promise<void> {
  // This would typically insert into a messages table
  // For now, we'll use the channel to broadcast
  const channel = supabase.channel(`channel:${channelId}`);
  
  await channel.send({
    type: "broadcast",
    event: "message",
    payload: {
      id: Date.now().toString(),
      content,
      user_id: userId,
      username,
      channel_id: channelId,
      created_at: new Date().toISOString(),
    },
  });
}

