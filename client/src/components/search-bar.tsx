import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  "data-testid"?: string;
}

export function SearchBar({ searchQuery, onSearchChange, "data-testid": testId }: SearchBarProps) {
  return (
    <div className="p-3 bg-gray-50 border-b sticky top-16 z-10" data-testid={testId}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp focus:border-transparent"
          data-testid="search-input"
        />
        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}
