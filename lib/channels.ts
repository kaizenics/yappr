import { supabase } from "./supabase";

export interface Channel {
  id: string;
  name: string;
  server_id: string;
  parent_id?: string | null;
  type: "text" | "voice" | "category";
  created_at?: string;
  created_by?: string;
  order_index?: number;
}

/**
 * Fetch all channels for a server (parent channels only)
 */
export async function fetchChannels(serverId: string = "general"): Promise<Channel[]> {
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .eq("server_id", serverId)
    .is("parent_id", null) // Only fetch parent channels
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching channels:", error);
    return [];
  }

  return (data as Channel[]) || [];
}

/**
 * Fetch all rooms (children) for a parent channel
 */
export async function fetchRooms(parentChannelId: string): Promise<Channel[]> {
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .eq("parent_id", parentChannelId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }

  return (data as Channel[]) || [];
}

/**
 * Create a new parent channel (category)
 */
export async function createChannel(
  name: string,
  serverId: string = "general",
  userId?: string,
  isCategory: boolean = true
): Promise<Channel | null> {
  const idBase = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 32);

  // Check if channel with this ID already exists
  const { data: existing } = await supabase
    .from("channels")
    .select("id")
    .eq("id", idBase)
    .eq("server_id", serverId)
    .single();

  const id = existing ? `channel-${Date.now()}` : idBase;

  // Get max order_index for this server to ensure proper ordering
  const { data: maxOrder } = await supabase
    .from("channels")
    .select("order_index")
    .eq("server_id", serverId)
    .is("parent_id", null)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrderIndex = maxOrder?.order_index != null ? (maxOrder.order_index + 1) : 0;

  const { data, error } = await supabase
    .from("channels")
    .insert({
      id,
      name: name.trim(),
      server_id: serverId,
      parent_id: null, // Parent channels have no parent
      type: isCategory ? "category" : "text",
      created_by: userId,
      order_index: nextOrderIndex,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating channel:", error);
    throw error;
  }

  return data as Channel;
}

/**
 * Create a new room (child) under a parent channel
 */
export async function createRoom(
  name: string,
  parentChannelId: string,
  serverId: string = "general",
  userId?: string,
  roomType: "text" | "voice" = "text"
): Promise<Channel | null> {
  const idBase = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 32);

  // Check if room with this ID already exists under this parent
  const { data: existing } = await supabase
    .from("channels")
    .select("id")
    .eq("id", idBase)
    .eq("parent_id", parentChannelId)
    .single();

  const id = existing ? `room-${Date.now()}` : idBase;

  // Get max order_index for this parent channel to ensure proper ordering
  const { data: maxOrder } = await supabase
    .from("channels")
    .select("order_index")
    .eq("parent_id", parentChannelId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrderIndex = maxOrder?.order_index != null ? (maxOrder.order_index + 1) : 0;

  const { data, error } = await supabase
    .from("channels")
    .insert({
      id,
      name: name.trim(),
      server_id: serverId,
      parent_id: parentChannelId,
      type: roomType,
      created_by: userId,
      order_index: nextOrderIndex,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating room:", error);
    throw error;
  }

  return data as Channel;
}

/**
 * Delete a channel (cascades to delete all rooms if it's a parent)
 */
export async function deleteChannel(
  channelId: string,
  serverId: string = "general"
): Promise<void> {
  const { error } = await supabase
    .from("channels")
    .delete()
    .eq("id", channelId)
    .eq("server_id", serverId);

  if (error) {
    console.error("Error deleting channel:", error);
    throw error;
  }
}

/**
 * Delete a room
 */
export async function deleteRoom(
  roomId: string,
  parentChannelId: string,
  serverId: string = "general"
): Promise<void> {
  const { error } = await supabase
    .from("channels")
    .delete()
    .eq("id", roomId)
    .eq("parent_id", parentChannelId)
    .eq("server_id", serverId);

  if (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
}

