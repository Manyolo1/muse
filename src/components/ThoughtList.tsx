import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Edit, Tag, Calendar, TrendingUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { thoughtStore } from '@/lib/thought-store';
import { Thought } from '@/lib/ai-service';
import { formatDistanceToNow } from 'date-fns';

interface ThoughtListProps {
  selectedTheme?: string;
  searchQuery?: string;
}

export const ThoughtList = ({ selectedTheme, searchQuery }: ThoughtListProps) => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  useEffect(() => {
    const updateThoughts = () => {
      let filteredThoughts = thoughtStore.getThoughts();
      
      if (selectedTheme) {
        filteredThoughts = thoughtStore.getThoughtsByTheme(selectedTheme);
      }
      
      if (searchQuery) {
        filteredThoughts = thoughtStore.getThoughtsByKeyword(searchQuery);
      }
      
      setThoughts(filteredThoughts);
    };

    updateThoughts();
    const unsubscribe = thoughtStore.subscribe(updateThoughts);
    return unsubscribe;
  }, [selectedTheme, searchQuery]);

  const handleDelete = (id: string) => {
    thoughtStore.deleteThought(id);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'hsl(120, 70%, 50%)';
      case 'negative': return 'hsl(0, 70%, 50%)';
      default: return 'hsl(60, 70%, 50%)';
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence > 0.8) return 'High';
    if (confidence > 0.6) return 'Medium';
    return 'Low';
  };

  if (thoughts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No thoughts yet</h3>
          <p>Start capturing your thoughts and let AI organize them for you.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {thoughts.map((thought) => (
        <Card key={thought.id} className="thought-container">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(thought.timestamp, { addSuffix: true })}
                </span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Tag className="h-4 w-4 mr-2" />
                    Change Theme
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(thought.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <p className="text-foreground mb-4 leading-relaxed">
              {thought.content}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge 
                variant="secondary" 
                className="theme-badge"
                style={{ borderColor: getSentimentColor(thought.analysis.sentiment) }}
              >
                {thought.userTheme || thought.analysis.category}
              </Badge>
              
              <Badge 
                variant="outline"
                style={{ 
                  color: getSentimentColor(thought.analysis.sentiment),
                  borderColor: getSentimentColor(thought.analysis.sentiment)
                }}
              >
                {thought.analysis.sentiment} ({getConfidenceLabel(thought.analysis.confidence)})
              </Badge>
            </div>
            
            {thought.analysis.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {thought.analysis.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
            
            {thought.analysis.themes.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                Themes: {thought.analysis.themes.join(', ')}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};