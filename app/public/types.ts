export interface Room {
  id: string;
  name: string;
  type: "text" | "voice";
  unread?: number;
}

export interface ChannelWithRooms {
  id: string;
  name: string;
  type: "category";
  rooms: Room[];
  expanded?: boolean;
}

