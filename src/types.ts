export type Topic = 'Sports' | 'Tech' | 'Politics' | 'Business' | 'Entertainment' | 'Science';
export type Region = 'World' | 'Thai' | 'SEA' | 'EU' | 'USA';

export interface Article {
  id: string;
  headline: string;
  summary: string;
  topic: Topic;
  region: Region;
  source: string;
  sourceUrl: string;
  publishedAt: string;
}

export const TOPICS: Topic[] = ['Sports', 'Tech', 'Politics', 'Business', 'Entertainment', 'Science'];
export const REGIONS: Region[] = ['World', 'Thai', 'SEA', 'EU', 'USA'];
