import type { Article } from '../types';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="article-card plate">
      <div className="article-meta">
        <span className="topic-pill">{article.topic}</span>
        <span className="region-tag">{article.region}</span>
        <span className="time-tag">{formatTime(article.publishedAt)}</span>
      </div>
      <h2 className="article-headline">{article.headline}</h2>
      <p className="article-summary">{article.summary}</p>
      <a className="article-source" href={article.sourceUrl} target="_blank" rel="noreferrer">
        {article.source} <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}
