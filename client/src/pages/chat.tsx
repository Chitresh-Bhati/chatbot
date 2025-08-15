import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChatHeader } from "@/components/chat-header";
import { SearchBar } from "@/components/search-bar";
import { ChatMessage } from "@/components/chat-message";
import { Lock } from "lucide-react";
import type { Conversation } from "@shared/schema";

export default function Chat() {
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: searchResults = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations/search", searchQuery],
    enabled: searchQuery.length > 0,
  });

  const displayedConversations = searchQuery ? searchResults : conversations;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!searchQuery && conversations.length > 0) {
      // Only auto-scroll when not searching
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [conversations, searchQuery]);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <ChatHeader data-testid="chat-header" />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading conversations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative" data-testid="chat-container">
      <ChatHeader data-testid="chat-header" />
      
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        data-testid="search-bar"
      />

      {/* Messages Container */}
      <div 
        className="pb-20 overflow-y-auto"
        style={{ height: "calc(100vh - 144px)" }}
        data-testid="messages-container"
      >
        {displayedConversations.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500" data-testid="no-results">
              {searchQuery ? "No conversations found" : "No conversations available"}
            </div>
          </div>
        ) : (
          <>
            {displayedConversations.map((conversation, index) => (
              <ChatMessage
                key={conversation.id}
                conversation={conversation}
                data-testid={`message-${index}`}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Bottom Navigation/Info */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-whatsapp text-white p-3 text-center" data-testid="bottom-info">
        <div className="flex items-center justify-center space-x-2 text-sm">
          <Lock className="h-3 w-3" />
          <span>End-to-end encrypted • 8-month health journey complete</span>
        </div>
      </div>
    </div>
  );
}
