import { Search, Filter } from "lucide-react"; // Import thêm icon Filter nếu thích
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  // --- Risk Filter ---
  showRiskFilter?: boolean;
  riskFilter?: string;
  onRiskFilterChange?: (value: string) => void;
  
  // --- Sentiment Filter (MỚI) ---
  showSentimentFilter?: boolean;
  sentimentFilter?: string;
  onSentimentFilterChange?: (value: string) => void;

  // --- Date Filter ---
  showDateFilter?: boolean;
  dateFilter?: string;
  onDateFilterChange?: (value: string) => void;

  // ... (Các props khác giữ nguyên)
  showSubredditFilter?: boolean;
  subredditFilter?: string;
  onSubredditFilterChange?: (value: string) => void;
  onClearFilters?: () => void;
}

export function FilterBar({
  searchValue = "",
  onSearchChange,
  
  showRiskFilter = false,
  riskFilter = "all",
  onRiskFilterChange,

  // Props mới
  showSentimentFilter = false,
  sentimentFilter = "all",
  onSentimentFilterChange,

  showDateFilter = false,
  dateFilter = "7days",
  onDateFilterChange,

  showSubredditFilter = false,
  subredditFilter = "all",
  onSubredditFilterChange,
  onClearFilters
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      {/* Ô Search giữ nguyên */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search content..."
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {/* --- DROPDOWN SENTIMENT (MỚI) --- */}
      {showSentimentFilter && (
        <Select value={sentimentFilter} onValueChange={onSentimentFilterChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiments</SelectItem>
            <SelectItem value="Positive">Positive</SelectItem>
            <SelectItem value="Neutral">Neutral</SelectItem>
            <SelectItem value="Negative">Negative</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* --- DROPDOWN RISK (CŨ) --- */}
      {showRiskFilter && (
        <Select value={riskFilter} onValueChange={onRiskFilterChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Các phần khác giữ nguyên ... */}
      {showSubredditFilter && (
         /* ... code cũ ... */
         <Select value={subredditFilter} onValueChange={onSubredditFilterChange}>
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Subreddits</SelectItem>
            </SelectContent>
         </Select>
      )}

      {onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear
        </Button>
      )}
    </div>
  );
}