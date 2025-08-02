import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, Brain, Hash } from 'lucide-react';
import { thoughtStore } from '@/lib/thought-store';

export const StatsPanel = () => {
  const [stats, setStats] = useState({
    totalThoughts: 0,
    todayThoughts: 0,
    sentimentDistribution: {} as Record<string, number>,
    topKeywords: [] as Array<{ keyword: string; count: number }>
  });

  useEffect(() => {
    const updateStats = () => {
      setStats(thoughtStore.getStats());
    };

    updateStats();
    const unsubscribe = thoughtStore.subscribe(updateStats);
    return unsubscribe;
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'hsl(120, 70%, 50%)';
      case 'negative': return 'hsl(0, 70%, 50%)';
      default: return 'hsl(60, 70%, 50%)';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[hsl(var(--neural-accent))]/20 rounded-lg">
            <Brain className="h-5 w-5 text-[hsl(var(--neural-accent))]" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Thoughts</p>
            <p className="text-2xl font-bold">{stats.totalThoughts}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[hsl(var(--semantic-accent))]/20 rounded-lg">
            <Calendar className="h-5 w-5 text-[hsl(var(--semantic-accent))]" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-2xl font-bold">{stats.todayThoughts}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sentiment</p>
            <div className="flex gap-1 mt-1">
              {Object.entries(stats.sentimentDistribution).map(([sentiment, count]) => (
                <div
                  key={sentiment}
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: getSentimentColor(sentiment),
                    width: `${Math.max(12, (count / stats.totalThoughts) * 100)}px`
                  }}
                  title={`${sentiment}: ${count}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Hash className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Top Keyword</p>
            <p className="text-lg font-semibold">
              {stats.topKeywords[0]?.keyword || 'None yet'}
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