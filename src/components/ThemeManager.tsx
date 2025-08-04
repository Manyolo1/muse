import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Palette, Hash, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { thoughtStore, Theme } from '@/lib/thought-store';
import { useToast } from '@/hooks/use-toast';

interface ThemeManagerProps {
  selectedTheme?: string;
  onThemeSelect: (themeId: string | undefined) => void;
}

export const ThemeManager = ({ selectedTheme, onThemeSelect }: ThemeManagerProps) => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isAddingTheme, setIsAddingTheme] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeColor, setNewThemeColor] = useState('#3b82f6');
  const { toast } = useToast();

  useEffect(() => {
    const updateThemes = () => {
      setThemes(thoughtStore.getThemes());
    };

    // Initial sync with backend state
    (async () => {
      try {
        await thoughtStore.loadThemesAndThoughts();
      } catch (error) {
        toast({
          title: "Error loading themes",
          description: "Please refresh or try again later.",
          variant: "destructive",
        });
      }
    })();

    updateThemes();
    const unsubscribe = thoughtStore.subscribe(updateThemes);
    return unsubscribe;
  }, [toast]);

  // Async add theme with error handling
  const handleAddTheme = async () => {
    if (!newThemeName.trim()) return;

    try {
      await thoughtStore.addTheme(newThemeName.trim(), newThemeColor);
      toast({
        title: "Theme created! 🎨",
        description: `"${newThemeName}" theme is ready to use`,
      });
      setNewThemeName('');
      setNewThemeColor('#3b82f6');
      setIsAddingTheme(false);
    } catch (error: any) {
      toast({
        title: "Failed to create theme",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  // Async delete theme with error handling
  const handleDeleteTheme = async (theme: Theme) => {
    if (!theme.isUserDefined) return;

    // Confirm before deleting
    if (!window.confirm(`Are you sure you want to delete the theme "${theme.name}"?`)) {
      return;
    }

    try {
      await thoughtStore.deleteTheme(theme.id);

      // If the deleted theme was selected, reset selection
      if (selectedTheme === theme.id) {
        onThemeSelect(undefined);
      }

      toast({
        title: "Theme deleted",
        description: `"${theme.name}" theme has been removed`,
      });
    } catch (error) {
      toast({
        title: "Failed to delete theme",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const predefinedColors = [
    '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981',
    '#f59e0b', '#ef4444', '#ec4899', '#6366f1',
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Uncomment if you want Palette icon */}
          {/* <Palette className="h-5 w-5 text-[hsl(var(--semantic-accent))]" /> */}
          <h2 className="text-lg font-semibold">Themes</h2>
        </div>

        <Dialog open={isAddingTheme} onOpenChange={setIsAddingTheme}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Theme
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Theme</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Theme Name</label>
                <Input
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder="Enter theme name..."
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <div className="flex gap-2 mb-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 border-transparent hover:border-white/50 transition-all ${
                        newThemeColor === color ? 'border-black dark:border-white' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewThemeColor(color)}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={newThemeColor}
                  onChange={(e) => setNewThemeColor(e.target.value)}
                  className="w-full h-10"
                  aria-label="Theme color picker"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingTheme(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTheme} disabled={!newThemeName.trim()}>
                  Create Theme
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        <Button
          variant={selectedTheme === undefined ? "default" : "ghost"}
          size="sm"
          onClick={() => onThemeSelect(undefined)}
          className="w-full justify-start"
        >
          <Hash className="h-4 w-4 mr-2" />
          All Thoughts ({themes.reduce((sum, theme) => sum + theme.thoughtCount, 0)})
        </Button>

        {themes.map((theme) => (
          <div key={theme.id} className="flex items-center gap-2">
            <Button
              variant={selectedTheme === theme.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onThemeSelect(theme.id)}
              className="flex-1 justify-start"
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: theme.color }}
              />
              {theme.name}
              <Badge variant="secondary" className="ml-auto">
                {theme.thoughtCount}
              </Badge>
            </Button>

            {theme.isUserDefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteTheme(theme)}
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Delete theme ${theme.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {themes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No themes yet. Add your first theme!</p>
        </div>
      )}
    </Card>
  );
};
