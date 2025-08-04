import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Brain, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { thoughtStore } from '@/lib/thought-store';

export const ThoughtInput = () => {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsAnalyzing(true);

    try {
      // Call thoughtStore.addThought which sends content to backend and gets back categorized thought
      const thoughtId = await thoughtStore.addThought(content);

      // Find the newly added thought to get its analysis/category info
      const addedThought = thoughtStore.getThoughts().find(t => t.id === thoughtId);

      // Show success toast with categorization info from backend response
      toast({
        title: "Thought captured! 🧠",
        description: addedThought
          ? `Categorized as ${addedThought.analysis.category} `
          : 'Thought saved successfully.',
      });

      setContent('');
    } catch (error) {
      console.error('Failed to add thought:', error);
      toast({
        title: "Error",
        description: "Failed to capture thought. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-6 neural-glow">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          {/* <Brain className="h-5 w-5 text-[hsl(var(--neural-accent))]" /> */}
          <h2 className="text-lg font-semibold">Capture Your Thought</h2>
          {/* <Sparkles className="h-4 w-4 text-[hsl(var(--semantic-accent))] semantic-pulse" /> */}
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Let the AI help organize your thoughts..."
          className="min-h-[120px] resize-none focus:ring-2 focus:ring-[hsl(var(--neural-accent))] transition-all duration-300"
          disabled={isAnalyzing}
        />

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">{content.length} characters</div>

          <Button
            type="submit"
            disabled={!content.trim() || isAnalyzing}
            className="bg-gradient-to-r from-yellow-200 to-green-300 hover:from-[hsl(var(--neural-accent))]/80 hover:to-[hsl(var(--semantic-accent))]/80 transition-all duration-300 rounded-3xl"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Dump Thought
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
