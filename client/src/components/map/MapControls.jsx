import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Clock, RefreshCw, Layers } from 'lucide-react';

// Toggle map pin points
export default function MapControls({
  filters,
  onFilterChange,
  counts,
  onRefresh,
  isRefreshing,
}) {
  const toggleFilter = (key) => {
    onFilterChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  return (
    <Card className="absolute top-4 right-4 z-[1000] shadow-lg">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 ml-auto"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>

        <div className="space-y-2">
          {/* Favorites filter */}
          <button
            onClick={() => toggleFilter('showFavorites')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              filters.showFavorites
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-muted/50 text-muted-foreground'
            }`}
          >
            <Star
              className={`h-4 w-4 ${
                filters.showFavorites ? 'fill-yellow-400 text-yellow-400' : ''
              }`}
            />
            <span>Favorites</span>
            <span className="ml-auto text-xs font-medium">
              {counts?.favorites || 0}
            </span>
          </button>

          {/* History filter */}
          <button
            onClick={() => toggleFilter('showHistory')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              filters.showHistory
                ? 'bg-slate-100 text-slate-800'
                : 'bg-muted/50 text-muted-foreground'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>History</span>
            <span className="ml-auto text-xs font-medium">
              {counts?.history || 0}
            </span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
