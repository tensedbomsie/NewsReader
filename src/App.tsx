import { useEffect, useState } from 'react';
import './App.css';
import AppSwitcher from './AppSwitcher';
import { FilterBar } from './components/FilterBar';
import { ArticleCard } from './components/ArticleCard';
import { mockArticles } from './data/mockArticles';
import { fetchLiveNews } from './lib/fetchNews';
import { TOPICS } from './types';
import type { Article, Region, Topic } from './types';

const TOPICS_KEY = 'daybrief.topics';
const REGIONS_KEY = 'daybrief.regions';

function loadList<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>(() => loadList(TOPICS_KEY, TOPICS));
  const [selectedRegions, setSelectedRegions] = useState<Region[]>(() => loadList(REGIONS_KEY, ['World', 'Thai']));
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try { localStorage.setItem(TOPICS_KEY, JSON.stringify(selectedTopics)); } catch { /* ignore */ }
  }, [selectedTopics]);

  useEffect(() => {
    try { localStorage.setItem(REGIONS_KEY, JSON.stringify(selectedRegions)); } catch { /* ignore */ }
  }, [selectedRegions]);

  function toggleTopic(topic: Topic) {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  }

  function toggleRegion(region: Region) {
    setSelectedRegions((prev) => (prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]));
  }

  async function handleGetNews() {
    setLoading(true);
    setError(null);
    try {
      const live = await fetchLiveNews(selectedTopics, selectedRegions);
      setArticles(live);
      setIsLive(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'could not fetch news right now');
    } finally {
      setLoading(false);
    }
  }

  const canFetch = selectedTopics.length > 0 && selectedRegions.length > 0;

  const filtered = isLive
    ? articles
    : articles.filter((article) => {
        const topicMatch = selectedTopics.length === 0 || selectedTopics.includes(article.topic);
        const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(article.region);
        return topicMatch && regionMatch;
      });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="page">
      <header className="topbar">
        <a className="hub-link" href="https://tensedbomsie.github.io/SatoruHUB/" title="กลับไป Satoru HUB">
          🏠
        </a>
        <AppSwitcher current="Daybrief" />
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">☀</span>
          <div>
            <h1>Daybrief</h1>
            <p className="topbar-date">{today}</p>
          </div>
        </div>
      </header>

      <FilterBar
        selectedTopics={selectedTopics}
        selectedRegions={selectedRegions}
        onToggleTopic={toggleTopic}
        onToggleRegion={toggleRegion}
      />

      <div className="fetch-row">
        <button
          type="button"
          className="btn-primary"
          disabled={!canFetch || loading}
          onClick={handleGetNews}
          title={canFetch ? undefined : 'Pick at least one topic and one region first'}
        >
          {loading ? 'Fetching today’s news…' : 'Get today’s news'}
        </button>
        {isLive && !loading && <span className="live-badge">Live results</span>}
        {!isLive && !loading && <span className="sample-badge">Showing sample stories</span>}
      </div>

      {error && (
        <div className="error-banner plate">
          Couldn&rsquo;t fetch live news: {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state plate">
          <p>No stories match this combination yet.</p>
          <p className="empty-hint">Try clearing a filter, or pick a different topic and region.</p>
        </div>
      ) : (
        <div className="article-grid">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
