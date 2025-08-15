import { cn } from "@/lib/utils";
import type { ChatMessage } from "@shared/schema";

interface AiChatMessageProps {
  message: ChatMessage;
  "data-testid"?: string;
}

export function AiChatMessage({ message, "data-testid": testId }: AiChatMessageProps) {
  const isFromUser = message.isFromUser === 1;
  const colorClass = message.senderColor === "user" ? "user" : message.senderColor;

  if (isFromUser) {
    return (
      <div className="px-4 py-2" data-testid={testId}>
        <div className="flex justify-end">
          <div className="bg-blue-500 text-white p-3 rounded-lg shadow-sm max-w-xs lg:max-w-md" data-testid="user-message">
            <p className="text-sm whitespace-pre-wrap" data-testid="message-text">{message.message}</p>
            <p className="text-xs opacity-75 text-right mt-1" data-testid="message-timestamp">{message.timestamp}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2" data-testid={testId}>
      <div className="flex items-start space-x-2">
        <div 
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            `bg-${colorClass}`
          )}
          data-testid="specialist-avatar"
        >
          <span className="text-white text-xs font-bold">{message.senderName?.[0] || "?"}</span>
        </div>
        <div className="flex-1">
          <div 
            className={cn(
              "bg-gray-100 p-3 rounded-lg shadow-sm border-l-4",
              `border-${colorClass}`
            )}
            data-testid="specialist-message"
          >
            <p className="text-xs text-gray-600 mb-1" data-testid="specialist-info">
              <strong>{message.senderName}</strong>
              {message.senderRole && ` (${message.senderRole})`} • {message.timestamp}
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap" data-testid="message-text">{message.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}