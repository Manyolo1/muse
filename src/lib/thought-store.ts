import api from './apiService';

export interface Theme {
  id: string;
  name: string;
  color: string;
  isUserDefined: boolean;
  thoughtCount: number;  // We'll compute locally based on fetched thoughts
}

export interface ThoughtAnalysis {
  category: string;
  keywords: string[];
  themes: string[];
  sentiment: string;
}

export interface Thought {
  id: string;
  content: string;
  timestamp: Date;
  analysis: ThoughtAnalysis;
  userTheme?: string | undefined; 
  theme?: Theme | null; // populated from API
}

class ThoughtStore {
  private static instance: ThoughtStore;
  private thoughts: Thought[] = [];
  private themes: Theme[] = [];
  private listeners: Array<() => void> = [];

  private constructor() {}

  static getInstance(): ThoughtStore {
    if (!ThoughtStore.instance) {
      ThoughtStore.instance = new ThoughtStore();
    }
    return ThoughtStore.instance;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  // --- CRUD and Load Methods ---

  async loadThemesAndThoughts(): Promise<void> {
    await Promise.all([this.loadThemes(), this.loadThoughts()]);
    this.computeThemeThoughtCounts();
    this.notify();
  }

  async loadThemes(): Promise<void> {
    try {
      const res = await api.get('/themes');
      // Backend returns themes with: _id, name, color, user
      this.themes = res.data.map((t: any) => ({
        id: t._id,
        name: t.name,
        color: t.color,
        isUserDefined: true, // We can mark false if you send default themes differently
        thoughtCount: 0,
      }));
    } catch (err) {
      console.error('Failed to load themes:', err);
      this.themes = [];
    }
  }

  async loadThoughts(): Promise<void> {
    try {
      const res = await api.get('/thoughts');
      // Backend returns thoughts with: _id, content, createdAt, theme, analysis

      this.thoughts = res.data.map((t: any) => ({
        id: t._id,
        content: t.content,
        timestamp: new Date(t.createdAt),
        analysis: t.analysis,
        userTheme: undefined,
        theme: t.theme
          ? {
              id: t.theme._id,
              name: t.theme.name,
              color: t.theme.color,
              isUserDefined: true,
              thoughtCount: 0,
            }
          : null,
      }));
    } catch (err) {
      console.error('Failed to load thoughts:', err);
      this.thoughts = [];
    }
  }

  // Create a new theme through backend
  async addTheme(name: string, color: string): Promise<string> {
    try {
      const res = await api.post('/themes', { name, color });
      const theme = {
        id: res.data._id,
        name: res.data.name,
        color: res.data.color,
        isUserDefined: true,
        thoughtCount: 0,
      };
      this.themes.push(theme);
      this.notify();
      return theme.id;
    } catch (err: any) {
      console.error('Failed to create theme:', err);
      throw new Error(err.response?.data?.error || 'Failed to create theme');
    }
  }

  async updateTheme(id: string, updates: Partial<Theme>): Promise<void> {
    try {
      await api.patch(`/themes/${id}`, updates);
      const idx = this.themes.findIndex((t) => t.id === id);
      if (idx !== -1) {
        this.themes[idx] = { ...this.themes[idx], ...updates };
        this.notify();
      }
    } catch (err) {
      console.error('Failed to update theme:', err);
      throw err;
    }
  }

  async deleteTheme(id: string): Promise<void> {
    try {
      await api.delete(`/themes/${id}`);
      this.themes = this.themes.filter((t) => t.id !== id);

      // Remove theme associations in thoughts that had it
      this.thoughts = this.thoughts.map((thought) =>
        thought.theme?.id === id ? { ...thought, theme: null } : thought
      );
      this.notify();
    } catch (err) {
      console.error('Failed to delete theme:', err);
      throw err;
    }
  }

  async addThought(content: string): Promise<string> {
    try {
      const res = await api.post('/thoughts', { content });
      const t = res.data;
      const newThought: Thought = {
        id: t._id,
        content: t.content,
        timestamp: new Date(t.createdAt),
        analysis: t.analysis,
        userTheme: undefined,
        theme: t.theme
          ? {
              id: t.theme._id,
              name: t.theme.name,
              color: t.theme.color,
              isUserDefined: true,
              thoughtCount: 0,
            }
          : null,
      };
      this.thoughts.unshift(newThought);
      this.computeThemeThoughtCounts();
      this.notify();
      return newThought.id;
    } catch (err) {
      console.error('Failed to add thought:', err);
      throw new Error('Could not add thought');
    }
  }

  async updateThought(
    id: string,
    updates: Partial<{ content: string; themeId: string | null }>
  ): Promise<void> {
    try {
      const res = await api.patch(`/thoughts/${id}`, updates);
      const updated = res.data;
      const index = this.thoughts.findIndex((t) => t.id === id);
      if (index !== -1) {
        this.thoughts[index] = {
          id: updated._id,
          content: updated.content,
          timestamp: new Date(updated.createdAt),
          analysis: updated.analysis,
          userTheme: undefined,
          theme: updated.theme
            ? {
                id: updated.theme._id,
                name: updated.theme.name,
                color: updated.theme.color,
                isUserDefined: true,
                thoughtCount: 0,
              }
            : null,
        };
        this.computeThemeThoughtCounts();
        this.notify();
      }
    } catch (err) {
      console.error('Failed to update thought:', err);
      throw new Error('Could not update thought');
    }
  }

  async deleteThought(id: string): Promise<void> {
    try {
      await api.delete(`/thoughts/${id}`);
      this.thoughts = this.thoughts.filter((t) => t.id !== id);
      this.computeThemeThoughtCounts();
      this.notify();
    } catch (err) {
      console.error('Failed to delete thought:', err);
      throw new Error('Could not delete thought');
    }
  }

  getThoughts(): Thought[] {
    return this.thoughts;
  }

  // Note: themeId here corresponds to theme.id (string)
  getThoughtsByTheme(themeId: string): Thought[] {
    return this.thoughts.filter((thought) => {
      // Either the thought explicitly has the theme or via its analysis category name matching theme
      if (thought.theme?.id === themeId) return true;
      // Also match analysis category (lowercased) to theme name lowercased as fallback
      return thought.analysis.category.toLowerCase() ===
        this.themes.find((t) => t.id === themeId)?.name.toLowerCase();
    });
  }

  getThoughtsByKeyword(keyword: string): Thought[] {
    const query = keyword.toLowerCase();
    return this.thoughts.filter(
      (thought) =>
        thought.content.toLowerCase().includes(query) ||
        thought.analysis.keywords.some((k) => k.toLowerCase().includes(query)) ||
        thought.analysis.themes.some((t) => t.toLowerCase().includes(query))
    );
  }

  getThemes(): Theme[] {
    return this.themes;
  }

  private computeThemeThoughtCounts() {
    // Reset counts
    this.themes.forEach((theme) => {
      theme.thoughtCount = 0;
    });

    // Count for each theme occurrences in thoughts
    this.thoughts.forEach((thought) => {
      const themeId = thought.theme?.id;
      if (themeId) {
        const theme = this.themes.find((t) => t.id === themeId);
        if (theme) theme.thoughtCount++;
      }
    });
  }

  // Export and import are optional. If you need to keep them, implement calls to backend export/import endpoints or keep local copy in sync.

  exportThoughts(): string {
    // Optionally implement if backend supports
    // Here just stringify current local state - not recommended if backend is source of truth
    return JSON.stringify({
      thoughts: this.thoughts,
      themes: this.themes,
      exportDate: new Date().toISOString(),
    }, null, 2);
  }

  // Import local data
  importThoughts(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.thoughts && parsed.themes) {
        this.thoughts = parsed.thoughts.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        }));
        this.themes = parsed.themes;
        this.computeThemeThoughtCounts();
        this.notify();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  // Additional stats computed locally (can be replaced with backend-driven analytics)

  getStats() {
    const totalThoughts = this.thoughts.length;
    const todayThoughts = this.thoughts.filter((t) => {
      const today = new Date();
      const thoughtDate = new Date(t.timestamp);
      return thoughtDate.toDateString() === today.toDateString();
    }).length;

    const sentimentDistribution = this.thoughts.reduce((acc, thought) => {
      acc[thought.analysis.sentiment] = (acc[thought.analysis.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topKeywords = this.thoughts
      .flatMap((t) => t.analysis.keywords)
      .reduce((acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalThoughts,
      todayThoughts,
      sentimentDistribution,
      topKeywords: Object.entries(topKeywords)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count })),
    };
  }
}

export const thoughtStore = ThoughtStore.getInstance();
