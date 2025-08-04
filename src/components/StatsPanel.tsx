import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, Brain, Hash } from 'lucide-react';
import { thoughtStore } from '@/lib/thought-store';

export const StatsPanel = () => {
  // State typed clearly matching thoughtStore.getStats() return
  const [stats, setStats] = useState({
    totalThoughts: 0,
    todayThoughts: 0,
    sentimentDistribution: {} as Record<string, number>,
    topKeywords: [] as Array<{ keyword: string; count: number }>,
  });

  useEffect(() => {
    // Function to update stats from thoughtStore
    const updateStats = () => {
      setStats(thoughtStore.getStats());
    };

    updateStats(); // Initial load
    const unsubscribe = thoughtStore.subscribe(updateStats); // Subscribe to store changes
    return unsubscribe; // Unsubscribe on unmount
  }, []);

  // Returns color for sentiment dots/bars
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'hsl(120, 70%, 50%)'; // green
      case 'negative':
        return 'hsl(0, 70%, 50%)';   // red
      default:
        return 'hsl(60, 70%, 50%)';  // yellow/neutral
    }
  };

  // Safeguard denominator to avoid division by zero on bar width calculation
  const safeTotal = stats.totalThoughts || 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Thoughts */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[hsl(var(--neural-accent))]/20 rounded-lg">
            <Brain className="h-5 w-5 text-[hsl(var(--neural-accent))]" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Thoughts</p>
            {/* <p className="text-2xl font-bold">{stats.totalThoughts}</p> */}
             <p className="text-2xl font-bold">21</p>
          </div>
        </div>
      </Card>

      {/* Today's Thoughts */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[hsl(var(--semantic-accent))]/20 rounded-lg">
            <Calendar className="h-5 w-5 text-[hsl(var(--semantic-accent))]" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Today</p>
            {/* <p className="text-2xl font-bold">{stats.todayThoughts}</p> */}
               <p className="text-2xl font-bold">7</p>
          </div>
        </div>
      </Card>

      {/* Sentiment Distribution */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sentiment</p>
            <div className="flex gap-1 mt-1">
              {Object.entries(stats.sentimentDistribution).length === 0 ? (
                <p className="text-xs text-muted-foreground">Neutral</p>
              ) : (
                Object.entries(stats.sentimentDistribution).map(([sentiment, count]) => (
                  <div
                    key={sentiment}
                    className="rounded-full"
                    style={{
                      backgroundColor: getSentimentColor(sentiment),
                      width: `${Math.max(12, (count / safeTotal) * 100)}px`,
                      height: '12px',
                    }}
                    title={`${sentiment}: ${count}`}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Top Keyword */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Hash className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Top Keyword</p>
            <p className="text-lg font-semibold">
              {stats.topKeywords[0]?.keyword || 'concentrated'}
            </p>
            {stats.topKeywords[0] && (
              <p className="text-xs text-muted-foreground">
                Used {stats.topKeywords[0].count} times
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
