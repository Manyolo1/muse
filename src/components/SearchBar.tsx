import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceTimeMs?: number; // debounce delay in milliseconds (optional)
}

export const SearchBar = ({
  onSearch,
  placeholder = "Search thoughts, keywords, themes...",
  debounceTimeMs = 300,
}: SearchBarProps) => {
  const [query, setQuery] = useState('');

  // Ref to track debounce timer
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function — calls onSearch only after user stops typing for debounceTimeMs
  const debouncedSearch = (value: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      onSearch(value.trim());
    }, debounceTimeMs);
  };

  // Call debounced search on query change
  useEffect(() => {
    debouncedSearch(query);
    // Cleanup on unmount or query change
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [query]);

  // Immediate clear and notify parent of empty search
  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
        aria-label="Search thoughts, keywords, themes"
      />
      {query && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSearch}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          aria-label="Clear search input"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
