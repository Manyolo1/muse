import { Thought, ThoughtAnalysis } from './ai-service';

export interface Theme {
  id: string;
  name: string;
  color: string;
  isUserDefined: boolean;
  thoughtCount: number;
}

class ThoughtStore {
  private static instance: ThoughtStore;
  private thoughts: Thought[] = [];
  private themes: Theme[] = [];
  private listeners: Array<() => void> = [];

  private constructor() {
    this.loadFromStorage();
    this.initializeDefaultThemes();
  }

  static getInstance(): ThoughtStore {
    if (!ThoughtStore.instance) {
      ThoughtStore.instance = new ThoughtStore();
    }
    return ThoughtStore.instance;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  private loadFromStorage(): void {
    try {
      const storedThoughts = localStorage.getItem('thoughts');
      const storedThemes = localStorage.getItem('themes');
      
      if (storedThoughts) {
        this.thoughts = JSON.parse(storedThoughts).map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp)
        }));
      }
      
      if (storedThemes) {
        this.themes = JSON.parse(storedThemes);
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('thoughts', JSON.stringify(this.thoughts));
      localStorage.setItem('themes', JSON.stringify(this.themes));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  private initializeDefaultThemes(): void {
    if (this.themes.length === 0) {
      const defaultThemes = [
        { id: 'professional', name: 'Professional', color: 'hsl(240, 100%, 70%)', isUserDefined: false, thoughtCount: 0 },
        { id: 'social', name: 'Social', color: 'hsl(280, 100%, 70%)', isUserDefined: false, thoughtCount: 0 },
        { id: 'wellness', name: 'Wellness', color: 'hsl(120, 100%, 70%)', isUserDefined: false, thoughtCount: 0 },
        { id: 'development', name: 'Development', color: 'hsl(60, 100%, 70%)', isUserDefined: false, thoughtCount: 0 },
        { id: 'creative', name: 'Creative', color: 'hsl(300, 100%, 70%)', isUserDefined: false, thoughtCount: 0 },
        { id: 'technical', name: 'Technical', color: 'hsl(200, 100%, 70%)', isUserDefined: false, thoughtCount: 0 },
        { id: 'general', name: 'General', color: 'hsl(0, 0%, 60%)', isUserDefined: false, thoughtCount: 0 }
      ];
      this.themes = defaultThemes;
      this.saveToStorage();
    }
  }

  addThought(content: string, analysis: ThoughtAnalysis, userTheme?: string): string {
    const thought: Thought = {
      id: this.generateId(),
      content,
      timestamp: new Date(),
      analysis,
      userTheme
    };

    this.thoughts.unshift(thought);
    this.updateThemeCounts();
    this.saveToStorage();
    this.notify();
    
    return thought.id;
  }

  updateThought(id: string, updates: Partial<Thought>): void {
    const index = this.thoughts.findIndex(t => t.id === id);
    if (index !== -1) {
      this.thoughts[index] = { ...this.thoughts[index], ...updates };
      this.updateThemeCounts();
      this.saveToStorage();
      this.notify();
    }
  }

  deleteThought(id: string): void {
    this.thoughts = this.thoughts.filter(t => t.id !== id);
    this.updateThemeCounts();
    this.saveToStorage();
    this.notify();
  }

  getThoughts(): Thought[] {
    return this.thoughts;
  }

  getThoughtsByTheme(themeId: string): Thought[] {
    return this.thoughts.filter(thought => {
      const effectiveTheme = thought.userTheme || thought.analysis.category.toLowerCase();
      return effectiveTheme === themeId || 
             this.themes.find(t => t.name.toLowerCase() === effectiveTheme)?.id === themeId;
    });
  }

  getThoughtsByKeyword(keyword: string): Thought[] {
    const query = keyword.toLowerCase();
    return this.thoughts.filter(thought => 
      thought.content.toLowerCase().includes(query) ||
      thought.analysis.keywords.some(k => k.includes(query)) ||
      thought.analysis.themes.some(t => t.includes(query))
    );
  }

  addTheme(name: string, color: string): string {
    const theme: Theme = {
      id: this.generateId(),
      name,
      color,
      isUserDefined: true,
      thoughtCount: 0
    };

    this.themes.push(theme);
    this.saveToStorage();
    this.notify();
    
    return theme.id;
  }

  updateTheme(id: string, updates: Partial<Theme>): void {
    const index = this.themes.findIndex(t => t.id === id);
    if (index !== -1) {
      this.themes[index] = { ...this.themes[index], ...updates };
      this.saveToStorage();
      this.notify();
    }
  }

  deleteTheme(id: string): void {
    const theme = this.themes.find(t => t.id === id);
    if (theme && theme.isUserDefined) {
      this.themes = this.themes.filter(t => t.id !== id);
      
      // Update thoughts that used this theme
      this.thoughts = this.thoughts.map(thought => {
        if (thought.userTheme === theme.name) {
          return { ...thought, userTheme: undefined };
        }
        return thought;
      });
      
      this.saveToStorage();
      this.notify();
    }
  }

  getThemes(): Theme[] {
    return this.themes;
  }

  private updateThemeCounts(): void {
    // Reset counts
    this.themes.forEach(theme => {
      theme.thoughtCount = 0;
    });

    // Count thoughts per theme
    this.thoughts.forEach(thought => {
      const effectiveTheme = thought.userTheme || thought.analysis.category;
      const theme = this.themes.find(t => 
        t.name.toLowerCase() === effectiveTheme.toLowerCase() ||
        t.id === effectiveTheme.toLowerCase()
      );
      
      if (theme) {
        theme.thoughtCount++;
      }
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  exportThoughts(): string {
    return JSON.stringify({
      thoughts: this.thoughts,
      themes: this.themes,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  importThoughts(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.thoughts && parsed.themes) {
        this.thoughts = parsed.thoughts.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp)
        }));
        this.themes = parsed.themes;
        this.updateThemeCounts();
        this.saveToStorage();
        this.notify();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  getStats() {
    const totalThoughts = this.thoughts.length;
    const todayThoughts = this.thoughts.filter(t => {
      const today = new Date();
      const thoughtDate = new Date(t.timestamp);
      return thoughtDate.toDateString() === today.toDateString();
    }).length;

    const sentimentDistribution = this.thoughts.reduce((acc, thought) => {
      acc[thought.analysis.sentiment] = (acc[thought.analysis.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topKeywords = this.thoughts
      .flatMap(t => t.analysis.keywords)
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
        .map(([keyword, count]) => ({ keyword, count }))
    };
  }
}

export const thoughtStore = ThoughtStore.getInstance();