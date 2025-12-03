"use client";

interface ActiveUsersSidebarProps {
  onlineUsers: string[];
}

export function ActiveUsersSidebar({ onlineUsers }: ActiveUsersSidebarProps) {
  return (
    <div className="w-64 bg-card/30 border-l hidden xl:flex flex-col pt-16">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-foreground">Active Yappers</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {onlineUsers.length} online in this room
        </p>
      </div>
      <div className="flex-1 p-4 space-y-3">
        {onlineUsers.map((user) => (
          <div
            key={user}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="relative">
              <div className="w-9 h-9 bg-linear-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-sm">
                {user.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                {user}
              </div>
              <div className="text-xs text-green-500">Active now</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

