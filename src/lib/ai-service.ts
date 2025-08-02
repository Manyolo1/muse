import { pipeline } from '@huggingface/transformers';

export interface ThoughtAnalysis {
  themes: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  category: string;
}

export interface Thought {
  id: string;
  content: string;
  timestamp: Date;
  analysis: ThoughtAnalysis;
  userTheme?: string;
}

class AIService {
  private static instance: AIService;
  private embeddingPipeline: any = null;
  private classificationPipeline: any = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing AI models...');
      
      // Initialize embedding model for semantic analysis
      this.embeddingPipeline = await pipeline(
        'feature-extraction',
        'mixedbread-ai/mxbai-embed-xsmall-v1',
        { device: 'webgpu' }
      );

      // Initialize classification model for sentiment analysis
      this.classificationPipeline = await pipeline(
        'sentiment-analysis',
        'cardiffnlp/twitter-roberta-base-sentiment-latest',
        { device: 'webgpu' }
      );

      this.isInitialized = true;
      console.log('AI models initialized successfully');
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU');
      
      // Fallback to CPU
      this.embeddingPipeline = await pipeline(
        'feature-extraction',
        'mixedbread-ai/mxbai-embed-xsmall-v1'
      );

      this.classificationPipeline = await pipeline(
        'sentiment-analysis',
        'cardiffnlp/twitter-roberta-base-sentiment-latest'
      );

      this.isInitialized = true;
    }
  }

  async analyzeThought(content: string): Promise<ThoughtAnalysis> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const [themes, sentiment, keywords] = await Promise.all([
      this.extractThemes(content),
      this.analyzeSentiment(content),
      this.extractKeywords(content)
    ]);

    const category = this.categorizeThought(content, themes, keywords);

    return {
      themes,
      sentiment: sentiment.label.toLowerCase() as 'positive' | 'negative' | 'neutral',
      confidence: sentiment.score,
      keywords,
      category
    };
  }

  private async extractThemes(content: string): Promise<string[]> {
    // Extract semantic themes using embeddings and clustering
    const themes: string[] = [];
    
    // Simple keyword-based theme extraction (can be enhanced with clustering)
    const themePatterns = {
      'work': ['job', 'work', 'career', 'office', 'project', 'meeting', 'deadline', 'boss', 'colleague'],
      'relationships': ['love', 'friend', 'family', 'partner', 'relationship', 'date', 'marriage', 'conflict'],
      'health': ['health', 'exercise', 'diet', 'doctor', 'medicine', 'fitness', 'wellness', 'mental'],
      'personal_growth': ['learn', 'grow', 'improve', 'goal', 'habit', 'skill', 'development', 'progress'],
      'creativity': ['art', 'music', 'write', 'create', 'design', 'imagination', 'inspiration', 'creative'],
      'technology': ['tech', 'computer', 'software', 'app', 'digital', 'internet', 'AI', 'programming'],
      'finance': ['money', 'budget', 'investment', 'saving', 'financial', 'expense', 'income', 'debt'],
      'travel': ['travel', 'vacation', 'trip', 'explore', 'adventure', 'journey', 'destination'],
      'spirituality': ['spiritual', 'meditation', 'mindfulness', 'faith', 'purpose', 'meaning', 'peace']
    };

    const lowerContent = content.toLowerCase();
    
    for (const [theme, keywords] of Object.entries(themePatterns)) {
      const matches = keywords.filter(keyword => lowerContent.includes(keyword));
      if (matches.length > 0) {
        themes.push(theme);
      }
    }

    return themes.length > 0 ? themes : ['general'];
  }

  private async analyzeSentiment(content: string): Promise<{ label: string; score: number }> {
    if (!this.classificationPipeline) {
      return { label: 'neutral', score: 0.5 };
    }

    try {
      const result = await this.classificationPipeline(content) as any;
      return {
        label: result[0].label,
        score: result[0].score
      };
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return { label: 'neutral', score: 0.5 };
    }
  }

  private extractKeywords(content: string): string[] {
    // Simple keyword extraction (can be enhanced with NLP)
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));

    // Get word frequency
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Return top keywords
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 
      'our', 'had', 'have', 'there', 'what', 'said', 'each', 'which', 'their', 'time',
      'will', 'about', 'would', 'been', 'this', 'that', 'they', 'were', 'from', 'with'
    ]);
    return stopWords.has(word);
  }

  private categorizeThought(content: string, themes: string[], keywords: string[]): string {
    // Intelligent categorization based on themes and content analysis
    if (themes.includes('work')) return 'Professional';
    if (themes.includes('relationships')) return 'Social';
    if (themes.includes('health')) return 'Wellness';
    if (themes.includes('personal_growth')) return 'Development';
    if (themes.includes('creativity')) return 'Creative';
    if (themes.includes('technology')) return 'Technical';
    if (themes.includes('finance')) return 'Financial';
    if (themes.includes('travel')) return 'Adventure';
    if (themes.includes('spirituality')) return 'Spiritual';
    
    // Content-based categorization
    if (content.includes('?')) return 'Questions';
    if (content.includes('!') && content.length < 50) return 'Insights';
    if (content.length > 200) return 'Deep Thoughts';
    
    return 'General';
  }

  async getSemanticSimilarity(thought1: string, thought2: string): Promise<number> {
    if (!this.embeddingPipeline) return 0;

    try {
      const [embedding1, embedding2] = await Promise.all([
        this.embeddingPipeline(thought1, { pooling: 'mean', normalize: true }),
        this.embeddingPipeline(thought2, { pooling: 'mean', normalize: true })
      ]);

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(
        embedding1.tolist()[0],
        embedding2.tolist()[0]
      );

      return similarity;
    } catch (error) {
      console.error('Similarity calculation failed:', error);
      return 0;
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

export const aiService = AIService.getInstance();