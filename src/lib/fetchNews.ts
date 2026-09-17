import { supabase } from './supabase';
import type { Article, Region, Topic } from '../types';

interface RawNewsItem {
  headline: string;
  summary: string;
  topic: string;
  region: string;
  source: string;
  sourceUrl: string;
}

export async function fetchLiveNews(topics: Topic[], regions: Region[]): Promise<Article[]> {
  const { data, error } = await supabase.functions.invoke<{ articles: RawNewsItem[]; error?: string }>('fetch-news', {
    body: { topics, regions },
  });

  if (error) throw error;
  if (!data || data.error) throw new Error(data?.error ?? 'no data returned');

  return data.articles.map((item, i) => ({
    id: `live-${Date.now()}-${i}`,
    headline: item.headline,
    summary: item.summary,
    topic: (topics.includes(item.topic as Topic) ? item.topic : topics[0]) as Topic,
    region: (regions.includes(item.region as Region) ? item.region : regions[0]) as Region,
    source: item.source,
    sourceUrl: item.sourceUrl,
    publishedAt: new Date().toISOString(),
  }));
}
