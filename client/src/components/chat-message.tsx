import { cn } from "@/lib/utils";
import type { Conversation } from "@shared/schema";

interface ChatMessageProps {
  conversation: Conversation;
  showAvatar?: boolean;
  "data-testid"?: string;
}

export function ChatMessage({ conversation, showAvatar = true, "data-testid": testId }: ChatMessageProps) {
  const isFromMember = conversation.isFromMember === 1;
  const colorClass = conversation.senderColor === "whatsapp" ? "whatsapp" : conversation.senderColor;

  // Month labels are handled on backend for organization, not displayed to users

  if (isFromMember) {
    return (
      <div className="px-4 py-2" data-testid={testId}>
        <div className="flex justify-end">
          <div className="bg-whatsapp text-white p-3 rounded-lg shadow-sm max-w-xs lg:max-w-md" data-testid="member-message">
            <p className="text-sm whitespace-pre-wrap" data-testid="message-text">{conversation.message}</p>
            <p className="text-xs opacity-75 text-right mt-1" data-testid="message-timestamp">{conversation.timestamp}</p>
          </div>
        </div>
      </div>
    );
  }

  // Team message layout (special handling for team celebration message)
  if (conversation.senderId === "team") {
    return (
      <div className="px-4 py-2" data-testid={testId}>
        <div className="flex items-start space-x-2">
          <div className="w-8 h-8 bg-whatsapp rounded-full flex items-center justify-center flex-shrink-0" data-testid="team-avatar">
            <span className="text-white text-xs font-bold">🎉</span>
          </div>
          <div className="flex-1">
            <div className="bg-gradient-to-r from-whatsapp to-whatsapp-dark text-white p-4 rounded-lg shadow-lg" data-testid="team-message">
              <p className="text-xs opacity-90 mb-2" data-testid="sender-info">
                <strong>{conversation.senderName}</strong> • {conversation.date}, {conversation.timestamp}
              </p>
              <p className="text-sm font-medium mb-2">🎊 8-Month Journey Complete! 🎊</p>
              <div className="text-xs space-y-1 opacity-90">
                {conversation.message.split('\n').slice(2, -2).map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              <p className="text-xs mt-3 italic">"The best investment you can make is in yourself." - Warren Buffett</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2" data-testid={testId}>
      <div className="flex items-start space-x-2">
        {showAvatar && (
          <div 
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              `bg-${colorClass}`
            )}
            data-testid="sender-avatar"
          >
            <span className="text-white text-xs font-bold">{conversation.senderName?.[0] || "?"}</span>
          </div>
        )}
        <div className="flex-1">
          <div 
            className={cn(
              "bg-white p-3 rounded-lg shadow-sm border-l-4",
              `border-${colorClass}`
            )}
            data-testid="team-message"
          >
            <p className="text-xs text-gray-600 mb-1" data-testid="sender-info">
              <strong>{conversation.senderName}</strong>
              {conversation.senderRole && ` (${conversation.senderRole})`} • {conversation.date}, {conversation.timestamp}
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap" data-testid="message-text">{conversation.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
