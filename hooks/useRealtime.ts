import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchMessages } from "@/lib/realtime";

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
 * Hook for real-time messaging using Supabase Realtime
 */
export interface TypingUser {
  user_id: string;
  username: string;
}

export function useRealtime(channelId: string) {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingChannelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const { user } = useAuth();

  useEffect(() => {
    if (!channelId) return;

    // Fetch initial messages
    fetchMessages(channelId)
      .then((initialMessages) => {
        setMessages(initialMessages);
      })
      .catch((error) => {
        console.error("Error fetching initial messages:", error);
      });

    // Create channel for messages
    const messageChannel = supabase
      .channel(`messages:${channelId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          console.log("✅ New message received via Realtime:", payload);
          const newMessage = payload.new as RealtimeMessage;
          console.log("Message details:", {
            id: newMessage.id,
            content: newMessage.content.substring(0, 50),
            channel_id: newMessage.channel_id,
            expected_channel: channelId,
          });
          
          // Verify channel_id matches
          if (newMessage.channel_id !== channelId) {
            console.warn(`⚠️ Channel mismatch: received ${newMessage.channel_id}, expected ${channelId}`);
            return;
          }
          
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) {
              console.log("Duplicate message detected, skipping:", newMessage.id);
              return prev;
            }
            console.log(`Adding new message. Total messages: ${prev.length + 1}`);
            return [...prev, newMessage];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          console.log("Message updated via Realtime:", payload);
          const updatedMessage = payload.new as RealtimeMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          console.log("Message deleted via Realtime:", payload);
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe((status, err) => {
        console.log(`Realtime subscription status for ${channelId}:`, status);
        if (err) {
          console.error("Realtime subscription error:", err);
          console.error("Error details:", JSON.stringify(err, null, 2));
        }
        setIsConnected(status === "SUBSCRIBED");
        
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to Realtime for messages");
          // Re-fetch messages when subscribed to ensure we have the latest
          fetchMessages(channelId)
            .then((latestMessages) => {
              console.log(`Fetched ${latestMessages.length} messages after subscription`);
              setMessages(latestMessages);
            })
            .catch((error) => {
              console.error("Error re-fetching messages after subscription:", error);
            });
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Channel error - Realtime replication may not be enabled for 'messages' table");
          console.error("Please enable Realtime replication in Supabase Dashboard → Database → Replication");
        } else if (status === "TIMED_OUT") {
          console.error("❌ Subscription timed out");
        } else if (status === "CLOSED") {
          console.warn("⚠️ Subscription closed");
        }
      });

    // Create presence channel for online users
    const presenceChannel = supabase.channel(`presence:${channelId}`, {
      config: {
        presence: {
          key: user?.id || "",
        },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.keys(state).map((key) => {
          const presences = state[key] as any[];
          return presences[0]?.username || key;
        });
        setOnlineUsers(users);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        const username = newPresences[0]?.username || key;
        setOnlineUsers((prev) => [...prev, username]);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setOnlineUsers((prev) => prev.filter((u) => u !== key));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && user) {
          await presenceChannel.track({
            user_id: user.id,
            username:
              user.user_metadata?.display_name ||
              user.email?.split("@")[0] ||
              "User",
            online_at: new Date().toISOString(),
          });
        }
      });

    // Create typing indicator channel using Broadcast
    const typingChannel = supabase.channel(`typing:${channelId}`, {
      config: {
        broadcast: { self: false }, // Don't echo back to sender
      },
    });

    typingChannel
      .on("broadcast", { event: "typing" }, (payload) => {
        const typingData = payload.payload as TypingUser;
        // Don't show typing indicator for current user
        if (typingData.user_id === user?.id) return;

        // Add user to typing list
        setTypingUsers((prev) => {
          if (prev.some((u) => u.user_id === typingData.user_id)) {
            return prev;
          }
          return [...prev, typingData];
        });

        // Clear existing timeout for this user
        const existingTimeout = typingTimeoutRef.current.get(typingData.user_id);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Remove typing indicator after 3 seconds of inactivity
        const timeout = setTimeout(() => {
          setTypingUsers((prev) =>
            prev.filter((u) => u.user_id !== typingData.user_id)
          );
          typingTimeoutRef.current.delete(typingData.user_id);
        }, 3000);

        typingTimeoutRef.current.set(typingData.user_id, timeout);
      })
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          console.log(`Typing channel subscription status: ${status}`);
        }
      });

    channelRef.current = messageChannel;
    typingChannelRef.current = typingChannel;

    return () => {
      // Clear all typing timeouts
      typingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutRef.current.clear();

      supabase.removeChannel(messageChannel);
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [channelId, user]);

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    // Stop typing indicator when sending message
    stopTypingIndicator();

    const username =
      user.user_metadata?.display_name ||
      user.email?.split("@")[0] ||
      "User";

    // Optimistically add message to UI immediately
    const optimisticMessage: RealtimeMessage = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      user_id: user.id,
      username,
      avatar_url: user.user_metadata?.avatar_url,
      channel_id: channelId,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      // Insert into database
      const { data, error } = await supabase
        .from("messages")
        .insert({
          content: content.trim(),
          user_id: user.id,
          username,
          avatar_url: user.user_metadata?.avatar_url,
          channel_id: channelId,
        })
        .select()
        .single();

      if (error) {
        console.error("Error sending message:", error);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        throw error;
      }

      // Replace optimistic message with real one from database
      if (data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMessage.id ? (data as RealtimeMessage) : m))
        );
        console.log("✅ Message sent successfully:", data.id);
      }
    } catch (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      throw error;
    }
  };

  const sendTypingIndicator = () => {
    if (!user || !typingChannelRef.current) return;

    const username =
      user.user_metadata?.display_name ||
      user.email?.split("@")[0] ||
      "User";

    typingChannelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        user_id: user.id,
        username,
      },
    });
  };

  const stopTypingIndicator = () => {
    // Clear typing indicator timeout if exists
    if (user) {
      const timeout = typingTimeoutRef.current.get(user.id);
      if (timeout) {
        clearTimeout(timeout);
        typingTimeoutRef.current.delete(user.id);
      }
    }
  };

  const refreshMessages = async () => {
    console.log("🔄 Manually refreshing messages...");
    try {
      const latestMessages = await fetchMessages(channelId);
      console.log(`✅ Refreshed ${latestMessages.length} messages`);
      setMessages(latestMessages);
      return latestMessages;
    } catch (error) {
      console.error("❌ Error refreshing messages:", error);
      throw error;
    }
  };

  return {
    messages,
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
    stopTypingIndicator,
    refreshMessages,
  };
}



