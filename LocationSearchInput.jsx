import { Loader2, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useI18n } from '../hooks/useI18n';
import { locationService } from '../services/locationService';

const buildPrimaryLine = (result) => {
  const parts = [result.street, result.settlement || result.city, result.district]
    .filter(Boolean)
    .filter((part, index, values) => values.indexOf(part) === index);

  if (parts.length) {
    return parts.join(', ');
  }

  return String(result.displayName || '').split(',')[0].trim();
};

export function LocationSearchInput({
  placeholder,
  onSelect,
  minLength = 2,
  debounceMs = 350,
  className = '',
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef(null);
  const debouncedQuery = useDebouncedValue(query, debounceMs);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (trimmed.length < minLength) {
      setResults([]);
      setIsOpen(false);
      setError(false);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    locationService
      .search(trimmed)
      .then((data) => {
        if (cancelled) return;
        setResults(data);
        setActiveIndex(-1);
        setIsOpen(true);
      })
      .catch(() => {
        if (cancelled) return;
        setResults([]);
        setError(true);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, minLength]);

  const selectResult = (result) => {
    if (!result) return;
    onSelect(result);
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      if (!results.length) return;
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, results.length - 1));
      setIsOpen(true);
      return;
    }

    if (event.key === 'ArrowUp') {
      if (!results.length) return;
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      setIsOpen(true);
      return;
    }

    if (event.key === 'Enter') {
      if (!isOpen || !results.length) return;
      event.preventDefault();
      selectResult(results[activeIndex >= 0 ? activeIndex : 0]);
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const showDropdown = isOpen && debouncedQuery.trim().length >= minLength;

  return (
    <div ref={containerRef} className={`relative ${className}`.trim()}>
      <div className="relative">
        {loading ? (
          <Loader2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-green-300" />
        ) : (
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-green-300" />
        )}
        <input
          className={`app-input pl-11 ${query ? 'pr-11' : ''}`.trim()}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length) setIsOpen(true);
          }}
          placeholder={placeholder}
        />
        {query ? (
          <button
            type="button"
            aria-label={t('common.reset')}
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-gray-200"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {error ? <p className="mt-1 text-xs text-red-300">{t('locationSearch.error')}</p> : null}

      {showDropdown ? (
        <div className="app-card absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto p-2">
          {results.length ? (
            results.map((result, index) => (
              <button
                key={result.id}
                type="button"
                className={`w-full rounded-xl px-3 py-2 text-left ${
                  index === activeIndex ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectResult(result)}
              >
                <p className="text-sm text-white">{buildPrimaryLine(result)}</p>
                <p className="text-xs text-gray-400">
                  {[result.district, result.region, result.displayName]
                    .filter(Boolean)
                    .filter((part, item, values) => values.indexOf(part) === item)
                    .join(' · ')}
                </p>
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-gray-500">{t('locationSearch.noResults')}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
