import { useState, useEffect } from 'react';
import { ThoughtInput } from '@/components/ThoughtInput';
import { ThoughtList } from '@/components/ThoughtList';
import { ThemeManager } from '@/components/ThemeManager';
import { SearchBar } from '@/components/SearchBar';
import { StatsPanel } from '@/components/StatsPanel';
import { Brain, Sparkles, Download, Upload, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { aiService } from '@/lib/ai-service';
import { thoughtStore } from '@/lib/thought-store';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedTheme, setSelectedTheme] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark');
    
    // Initialize AI service
    const initAI = async () => {
      try {
        await aiService.initialize();
        setIsInitializing(false);
        toast({
          title: "AI Powered Thought Dump Ready! 🚀",
          description: "Your thoughts will be intelligently categorized using semantic analysis",
        });
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        setIsInitializing(false);
        toast({
          title: "AI Initialization Failed",
          description: "The app will work with limited functionality",
          variant: "destructive",
        });
      }
    };

    initAI();
  }, [toast]);

  const handleExport = () => {
    const data = thoughtStore.exportThoughts();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thought-dump-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete! 📄",
      description: "Your thoughts have been exported successfully",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = thoughtStore.importThoughts(content);
      
      if (success) {
        toast({
          title: "Import Complete! 📥",
          description: "Your thoughts have been imported successfully",
        });
      } else {
        toast({
          title: "Import Failed",
          description: "Invalid file format or corrupted data",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[hsl(var(--neural-accent))] to-[hsl(var(--semantic-accent))] rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(var(--neural-accent))] to-[hsl(var(--semantic-accent))] bg-clip-text text-transparent">
                  Thought Dump AI
                </h1>
                <p className="text-muted-foreground">Intelligent thought organization with semantic analysis</p>
              </div>
              <Sparkles className="h-6 w-6 text-[hsl(var(--semantic-accent))] semantic-pulse" />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <label>
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isInitializing && (
            <Card className="p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin">
                  <Brain className="h-5 w-5 text-[hsl(var(--neural-accent))]" />
                </div>
                <span className="text-sm text-muted-foreground">Initializing AI models for semantic analysis...</span>
              </div>
            </Card>
          )}
        </header>

        {/* Stats Panel */}
        <StatsPanel />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <SearchBar onSearch={setSearchQuery} />
            <ThemeManager selectedTheme={selectedTheme} onThemeSelect={setSelectedTheme} />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <ThoughtInput />
            <ThoughtList selectedTheme={selectedTheme} searchQuery={searchQuery} />
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by AI semantic analysis • Built with React & Transformers.js
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
