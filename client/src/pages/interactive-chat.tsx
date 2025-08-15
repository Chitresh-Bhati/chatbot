import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChatHeader } from "@/components/chat-header";
import { AiChatMessage } from "@/components/ai-chat-message";
import { ChatInput } from "@/components/chat-input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatMessage, FileAttachment } from "@shared/schema";

export default function InteractiveChat() {
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatMessages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat-messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, files }: { message: string; files?: FileAttachment[] }) => {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/chat", { 
        message, 
        files,
        userId: "default-user", // In production, this would come from auth
        sessionId: "current-session"
      });
      return await response.json();
    },
    onSuccess: (data) => {
      // Handle emergency alerts
      if (data.emergencyAlert?.isEmergency) {
        // In a real app, you might show a modal or special notification
        console.warn("Emergency detected:", data.emergencyAlert);
      }
      
      // Handle file processing results
      if (data.processedFiles?.length > 0) {
        console.log("Files processed:", data.processedFiles);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/chat-messages"] });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      setIsLoading(false);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [chatMessages]);

  const handleSendMessage = (message: string, files?: FileAttachment[]) => {
    sendMessageMutation.mutate({ message, files });
  };

  if (messagesLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <ChatHeader data-testid="chat-header" />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col" data-testid="interactive-chat-container">
      <ChatHeader data-testid="chat-header" />
      
      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto pb-4"
        style={{ height: "calc(100vh - 144px)" }}
        data-testid="messages-container"
      >
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center px-6" data-testid="empty-chat">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Ask Your Health Question</h3>
              <p className="text-sm text-gray-500 mb-4">Get expert advice from our Singapore-based specialists</p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>💊 Upload lab results for analysis</p>
                <p>🏥 Emergency detection available</p>
                <p>✈️ Travel health advisories</p>
                <p>📊 Persistent medical records</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((message, index) => (
              <AiChatMessage
                key={message.id}
                message={message}
                data-testid={`chat-message-${index}`}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        data-testid="chat-input-container"
      />
    </div>
  );
}