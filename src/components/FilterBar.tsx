import type { Region, Topic } from '../types';
import { REGIONS, TOPICS } from '../types';

interface FilterBarProps {
  selectedTopics: Topic[];
  selectedRegions: Region[];
  onToggleTopic: (topic: Topic) => void;
  onToggleRegion: (region: Region) => void;
}

export function FilterBar({ selectedTopics, selectedRegions, onToggleTopic, onToggleRegion }: FilterBarProps) {
  return (
    <div className="filter-bar plate">
      <div className="filter-group">
        <span className="filter-label">Topics</span>
        <div className="chip-row">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              className={`chip${selectedTopics.includes(topic) ? ' chip-active' : ''}`}
              aria-pressed={selectedTopics.includes(topic)}
              onClick={() => onToggleTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <span className="filter-label">Region</span>
        <div className="chip-row">
          {REGIONS.map((region) => (
            <button
              key={region}
              type="button"
              className={`chip${selectedRegions.includes(region) ? ' chip-active' : ''}`}
              aria-pressed={selectedRegions.includes(region)}
              onClick={() => onToggleRegion(region)}
            >
              {region}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
