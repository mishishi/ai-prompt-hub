import { describe, it, expect } from 'vitest';

interface LeaderboardEntry {
  id: string;
  name: string;
  copies: number;
  likes: number;
  createdAt: string;
}

function filterByPeriod(templates: LeaderboardEntry[], period: 'week' | 'month' | 'all'): LeaderboardEntry[] {
  if (period === 'all') return [...templates];
  const now = Date.now();
  const cutoff = period === 'week'
    ? now - 7 * 24 * 60 * 60 * 1000
    : now - 30 * 24 * 60 * 60 * 1000;
  return templates.filter(t => new Date(t.createdAt).getTime() >= cutoff);
}

function rankByCopies(templates: LeaderboardEntry[], limit: number): LeaderboardEntry[] {
  return [...templates].sort((a, b) => b.copies - a.copies).slice(0, limit);
}

describe('Leaderboard logic', () => {
  const templates: LeaderboardEntry[] = [
    { id: '1', name: 'Recent Hot', copies: 50, likes: 20, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: '2', name: 'Old Classic', copies: 100, likes: 50, createdAt: new Date(Date.now() - 90 * 86400000).toISOString() },
    { id: '3', name: 'Medium', copies: 30, likes: 5, createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  ];

  it('filters to last 7 days for weekly', () => {
    const result = filterByPeriod(templates, 'week');
    expect(result.length).toBe(2);
    expect(result.map(t => t.id)).toEqual(['1', '3']);
  });

  it('filters to last 30 days for monthly', () => {
    const result = filterByPeriod(templates, 'month');
    expect(result.length).toBe(2);
  });

  it('returns all for "all" period', () => {
    const result = filterByPeriod(templates, 'all');
    expect(result.length).toBe(3);
  });

  it('ranks by copies descending', () => {
    const ranked = rankByCopies(templates, 3);
    expect(ranked[0].copies).toBe(100);
    expect(ranked[1].copies).toBe(50);
    expect(ranked[2].copies).toBe(30);
  });

  it('limits results', () => {
    const ranked = rankByCopies(templates, 2);
    expect(ranked.length).toBe(2);
  });

  it('combined filter + rank', () => {
    const filtered = filterByPeriod(templates, 'week');
    const ranked = rankByCopies(filtered, 5);
    expect(ranked[0].id).toBe('1');
  });
});