import { Heart, MessageCircle, History } from "lucide-react";
import { Link, useLocation } from "wouter";

interface ChatHeaderProps {
  "data-testid"?: string;
}

export function ChatHeader({ "data-testid": testId }: ChatHeaderProps) {
  const [location] = useLocation();
  
  return (
    <div className="bg-whatsapp text-white p-4 sticky top-0 z-10 shadow-lg" data-testid={testId}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center" data-testid="header-icon">
          <Heart className="text-whatsapp h-5 w-5" />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-lg" data-testid="header-title">Elyx Concierge Team</h1>
          <p className="text-xs opacity-90" data-testid="header-subtitle">6 healthcare specialists</p>
        </div>
        <div className="flex space-x-1">
          <Link href="/">
            <button 
              className={`text-white p-2 rounded-full transition-colors ${
                location === "/" ? "bg-whatsapp-dark" : "hover:bg-whatsapp-dark"
              }`}
              data-testid="history-button"
              title="View Journey History"
            >
              <History className="h-5 w-5" />
            </button>
          </Link>
          <Link href="/chat">
            <button 
              className={`text-white p-2 rounded-full transition-colors ${
                location === "/chat" ? "bg-whatsapp-dark" : "hover:bg-whatsapp-dark"
              }`}
              data-testid="chat-button"
              title="Ask Questions"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
