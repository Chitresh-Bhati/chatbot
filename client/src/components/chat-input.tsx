import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { FileUpload } from "./file-upload";
import type { FileAttachment } from "@shared/schema";

interface ChatInputProps {
  onSendMessage: (message: string, files?: FileAttachment[]) => void;
  isLoading?: boolean;
  "data-testid"?: string;
}

export function ChatInput({ 
  onSendMessage, 
  isLoading = false, 
  "data-testid": testId 
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileAttachment[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedFiles.length > 0) && !isLoading) {
      onSendMessage(message.trim(), selectedFiles);
      setMessage("");
      setSelectedFiles([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t bg-white p-4" data-testid={testId}>
      {/* Compact file upload area - only show when files are selected or during upload */}
      {(selectedFiles.length > 0 || isLoading) && (
        <div className="mb-3">
          <FileUpload
            onFilesSelected={setSelectedFiles}
            selectedFiles={selectedFiles}
            isUploading={isLoading}
            data-testid="chat-file-upload"
          />
        </div>
      )}
      
      {/* Message Input with compact file button */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        {/* File upload button positioned next to input */}
        {selectedFiles.length === 0 && !isLoading && (
          <FileUpload
            onFilesSelected={setSelectedFiles}
            selectedFiles={selectedFiles}
            isUploading={isLoading}
            data-testid="chat-file-upload-compact"
          />
        )}
        
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your health question or attach medical records..."
            disabled={isLoading}
            rows={1}
            className="min-h-[44px] max-h-32 resize-none"
            data-testid="message-input"
          />
        </div>
        
        <Button
          type="submit"
          disabled={(!message.trim() && selectedFiles.length === 0) || isLoading}
          size="sm"
          className="bg-whatsapp hover:bg-whatsapp-dark h-11"
          data-testid="send-button"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      
      {/* Drop zone hint - only show when no files selected */}
      {selectedFiles.length === 0 && !isLoading && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-400">
            💡 Tip: You can also drag and drop medical files directly into the chat
          </p>
        </div>
      )}
    </div>
  );
}