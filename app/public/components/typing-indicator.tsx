"use client";

interface TypingUser {
  user_id: string;
  username: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex gap-3 md:gap-4 px-2 md:px-4 py-2">
      <div className="w-9 h-9 md:w-11 md:h-11 bg-muted/50 rounded-xl flex items-center justify-center shrink-0">
        <div className="flex gap-1 items-center">
          <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"></span>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex items-center">
        <p className="text-sm text-muted-foreground">
          {typingUsers.length === 1 ? (
            <>
              <span className="font-medium">{typingUsers[0].username}</span>
              <span className="ml-1">is typing</span>
            </>
          ) : typingUsers.length === 2 ? (
            <>
              <span className="font-medium">{typingUsers[0].username}</span>
              <span className="mx-1">and</span>
              <span className="font-medium">{typingUsers[1].username}</span>
              <span className="ml-1">are typing</span>
            </>
          ) : (
            <>
              <span className="font-medium">{typingUsers[0].username}</span>
              <span className="mx-1">and</span>
              <span className="font-medium">{typingUsers.length - 1} others</span>
              <span className="ml-1">are typing</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
