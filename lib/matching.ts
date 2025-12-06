import { supabase } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  channel_id: string;
  created_at: string;
  status: "active" | "ended";
}

export interface SearchingUser {
  user_id: string;
  username: string;
  searching_at: string;
}

// Cache to track if matches table exists (to avoid repeated queries)
let matchesTableExists: boolean | null = null;

// In-memory match store (used when matches table doesn't exist)
const inMemoryMatches = new Map<string, Match>();

/**
 * Get match key for a pair of users
 */
function getMatchKey(user1Id: string, user2Id: string): string {
  const sortedIds = [user1Id, user2Id].sort();
  return `${sortedIds[0]}-${sortedIds[1]}`;
}

/**
 * Join the matching queue to find a random user
 */
export async function joinMatchQueue(
  userId: string,
  username: string,
  onMatchFound?: (matchedUserId: string) => void
): Promise<RealtimeChannel> {
  const queueChannel = supabase.channel("match-queue", {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  let isSubscribed = false;
  let isMatching = false; // Prevent multiple match attempts

  const attemptMatch = async (matchedUserId: string) => {
    if (isMatching) return;
    
    isMatching = true;
    try {
      // Check if match already exists to avoid duplicates
      const existingMatch = await getActiveMatch(userId);
      if (existingMatch) {
        isMatching = false;
        // If match exists, trigger callback immediately
        if (onMatchFound) {
          onMatchFound(matchedUserId);
        }
        return;
      }

      const match = await createMatch(userId, matchedUserId);
      
      // Trigger callback immediately after creating match
      if (match && onMatchFound) {
        // Small delay to ensure match is stored
        setTimeout(() => {
          onMatchFound(matchedUserId);
        }, 100);
      }
    } catch (error: any) {
      // Only log if it's not a table-not-found error
      if (error?.code !== "PGRST116" && error?.code !== "PGRST205" && 
          !error?.message?.includes("Could not find the table")) {
        console.error("Error creating match:", error);
      }
    } finally {
      // Reset after a delay to allow for match creation
      setTimeout(() => {
        isMatching = false;
      }, 2000);
    }
  };

  await queueChannel
    .on("presence", { event: "sync" }, async () => {
      if (!isSubscribed || isMatching) return;
      
      const state = queueChannel.presenceState();
      const otherUsers = Object.keys(state).filter((key) => key !== userId);
      
      if (otherUsers.length > 0) {
        // Found another user, create a match (use first available)
        const matchedUserId = otherUsers[0];
        await attemptMatch(matchedUserId);
      }
    })
    .on("presence", { event: "join" }, async ({ key, newPresences }) => {
      if (!isSubscribed || key === userId || isMatching) return;
      
      // Another user joined, try to match
      await attemptMatch(key);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        isSubscribed = true;
        await queueChannel.track({
          user_id: userId,
          username,
          searching_at: new Date().toISOString(),
        });
      }
    });

  return queueChannel;
}

/**
 * Leave the matching queue
 */
export async function leaveMatchQueue(channel: RealtimeChannel): Promise<void> {
  await channel.untrack();
  supabase.removeChannel(channel);
}

/**
 * Create a match between two users
 */
export async function createMatch(user1Id: string, user2Id: string): Promise<Match | null> {
  // Generate a unique channel ID for the match (deterministic based on user IDs)
  const sortedIds = [user1Id, user2Id].sort();
  const channelId = `match-${sortedIds[0]}-${sortedIds[1]}`;

  // Check in-memory matches first
  const matchKey = getMatchKey(user1Id, user2Id);
  const existingInMemoryMatch = inMemoryMatches.get(matchKey);
  if (existingInMemoryMatch && existingInMemoryMatch.status === "active") {
    return existingInMemoryMatch;
  }

  // Check if match already exists in database
  const { data: existingMatch, error: fetchError } = await supabase
    .from("matches")
    .select("*")
    .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
    .eq("status", "active")
    .maybeSingle();

  // If table doesn't exist or error, create match object without DB
  // PGRST116 = relation does not exist, PGRST205 = table not found in schema cache
  if (fetchError && (fetchError.code === "PGRST116" || fetchError.code === "PGRST205" || 
      (fetchError.message && fetchError.message.includes("Could not find the table")))) {
    matchesTableExists = false;
    // Table doesn't exist, return match object
    const match: Match = {
      id: channelId,
      user1_id: user1Id,
      user2_id: user2Id,
      channel_id: channelId,
      created_at: new Date().toISOString(),
      status: "active",
    };
    inMemoryMatches.set(matchKey, match);
    return match;
  }

  if (existingMatch) {
    matchesTableExists = true;
    return existingMatch as Match;
  }

  // Create new match
  const { data, error } = await supabase
    .from("matches")
    .insert({
      user1_id: user1Id,
      user2_id: user2Id,
      channel_id: channelId,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    // If table doesn't exist, silently fallback (don't log error)
    // PGRST116 = relation does not exist, PGRST205 = table not found in schema cache
    if (error.code === "PGRST116" || error.code === "PGRST205" || 
        (error.message && error.message.includes("Could not find the table"))) {
      matchesTableExists = false;
      // Table doesn't exist, store in memory
      const match: Match = {
        id: channelId,
        user1_id: user1Id,
        user2_id: user2Id,
        channel_id: channelId,
        created_at: new Date().toISOString(),
        status: "active",
      };
      const matchKey = getMatchKey(user1Id, user2Id);
      inMemoryMatches.set(matchKey, match);
      return match;
    }
    console.error("Error creating match:", error);
    // Fallback: return match object without DB storage
    const match: Match = {
      id: channelId,
      user1_id: user1Id,
      user2_id: user2Id,
      channel_id: channelId,
      created_at: new Date().toISOString(),
      status: "active",
    };
    const matchKey = getMatchKey(user1Id, user2Id);
    inMemoryMatches.set(matchKey, match);
    return match;
  }

  matchesTableExists = true;
  return data as Match;
}

/**
 * Get active match for a user
 */
export async function getActiveMatch(userId: string): Promise<Match | null> {
  // First check in-memory matches
  for (const [key, match] of inMemoryMatches.entries()) {
    if ((match.user1_id === userId || match.user2_id === userId) && match.status === "active") {
      return match;
    }
  }

  // If we know the table doesn't exist, skip the query
  if (matchesTableExists === false) {
    return null;
  }

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // If table doesn't exist, cache this and return null
  // PGRST116 = relation does not exist, PGRST205 = table not found in schema cache
  if (error && (error.code === "PGRST116" || error.code === "PGRST205" || 
      (error.message && error.message.includes("Could not find the table")))) {
    matchesTableExists = false;
    return null;
  }

  // If we got data, table exists
  if (data !== null) {
    matchesTableExists = true;
  }

  if (error) {
    console.error("Error fetching match:", error);
    return null;
  }

  return data as Match | null;
}

/**
 * End a match
 */
export async function endMatch(matchId: string): Promise<void> {
  // Remove from in-memory store
  for (const [key, match] of inMemoryMatches.entries()) {
    if (match.id === matchId) {
      inMemoryMatches.delete(key);
      break;
    }
  }

  const { error } = await supabase
    .from("matches")
    .update({ status: "ended" })
    .eq("id", matchId);

  // If table doesn't exist, silently fail (matches are ephemeral)
  // PGRST116 = relation does not exist, PGRST205 = table not found in schema cache
  if (error && (error.code === "PGRST116" || error.code === "PGRST205" || 
      (error.message && error.message.includes("Could not find the table")))) {
    return;
  }

  if (error) {
    console.error("Error ending match:", error);
  }
}

/**
 * Get matched user info from presence or profiles
 */
export async function getMatchedUserInfo(
  match: Match,
  currentUserId: string,
  presenceChannel?: RealtimeChannel
): Promise<{ id: string; username: string } | null> {
  const matchedUserId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;

  // Try to get from presence first
  if (presenceChannel) {
    const state = presenceChannel.presenceState();
    const matchedPresence = state[matchedUserId];
    if (matchedPresence && Array.isArray(matchedPresence) && matchedPresence.length > 0) {
      const presence = matchedPresence[0] as { username?: string; user_id?: string };
      return {
        id: matchedUserId,
        username: presence.username || "Anonymous",
      };
    }
  }

  // Fallback to profiles table
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("id", matchedUserId)
    .single();

  if (error || !data) {
    return {
      id: matchedUserId,
      username: "Anonymous",
    };
  }

  return {
    id: data.id,
    username: data.display_name || data.username || "Anonymous",
  };
}

/**
 * Find available users in the queue (for display purposes)
 */
export async function getAvailableUsers(currentUserId: string): Promise<SearchingUser[]> {
  // This would typically query a presence channel or database
  // For now, we'll use a presence channel to get searching users
  return [];
}

