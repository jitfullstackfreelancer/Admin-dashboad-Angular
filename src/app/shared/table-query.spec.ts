import { convertToParamMap } from '@angular/router';
import { applyTableQuery, readChoice, readTableQuery } from './table-query';

interface SampleRow {
  id: string;
  name: string;
  amount: number;
  date: string;
}

const rows: SampleRow[] = [
  { id: 'b', name: 'Nora Blake', amount: 10, date: '2026-09-02T00:00:00' },
  { id: 'a', name: 'priya shah', amount: 100, date: '2026-10-01T00:00:00' },
  { id: 'c', name: 'Jonas Keller', amount: 2, date: '2026-09-15T00:00:00' },
];

describe('readTableQuery', () => {
  const defaults = { sort: '-date', pageSize: 8 };

  it('uses defaults when params are missing', () => {
    expect(readTableQuery(convertToParamMap({}), defaults)).toEqual({
      q: '',
      sort: '-date',
      page: 1,
      pageSize: 8,
    });
  });

  it('reads search, sort, and page from params', () => {
    const params = convertToParamMap({ q: 'nora', sort: 'name', page: '3' });
    expect(readTableQuery(params, defaults)).toEqual({
      q: 'nora',
      sort: 'name',
      page: 3,
      pageSize: 8,
    });
  });

  it('rejects invalid pages', () => {
    expect(readTableQuery(convertToParamMap({ page: '0' }), defaults).page).toBe(1);
    expect(readTableQuery(convertToParamMap({ page: '-4' }), defaults).page).toBe(1);
    expect(readTableQuery(convertToParamMap({ page: 'abc' }), defaults).page).toBe(1);
  });
});

describe('readChoice', () => {
  const allowed = ['paid', 'pending'];

  it('returns a known value', () => {
    expect(readChoice(convertToParamMap({ status: 'paid' }), 'status', allowed)).toBe('paid');
  });

  it('falls back when the value is missing or unknown', () => {
    expect(readChoice(convertToParamMap({}), 'status', allowed)).toBe('all');
    expect(readChoice(convertToParamMap({ status: 'archived' }), 'status', allowed)).toBe('all');
  });
});

describe('applyTableQuery', () => {
  const base = { q: '', sort: 'name', page: 1, pageSize: 2 };

  it('returns every row when the search is blank', () => {
    const result = applyTableQuery(rows, { ...base, pageSize: 10 }, ['name']);
    expect(result.total).toBe(3);
    expect(result.items).toHaveLength(3);
  });

  it('filters across the requested keys without case sensitivity', () => {
    const result = applyTableQuery(rows, { ...base, q: '  PRIYA ', pageSize: 10 }, ['name', 'id']);
    expect(result.items.map((row) => row.id)).toEqual(['a']);
  });

  it('matches any configured search key', () => {
    const result = applyTableQuery(rows, { ...base, q: 'b', pageSize: 10 }, ['id', 'name']);
    expect(result.items.map((row) => row.id)).toEqual(['b']);
  });

  it('sorts numbers ascending and descending', () => {
    const ascending = applyTableQuery(rows, { ...base, sort: 'amount', pageSize: 10 }, ['name']);
    const descending = applyTableQuery(rows, { ...base, sort: '-amount', pageSize: 10 }, ['name']);
    expect(ascending.items.map((row) => row.amount)).toEqual([2, 10, 100]);
    expect(descending.items.map((row) => row.amount)).toEqual([100, 10, 2]);
  });

  it('sorts text without case sensitivity and keeps the original order for ties', () => {
    const sorted = applyTableQuery(rows, { ...base, sort: 'name', pageSize: 10 }, ['name']);
    expect(sorted.items.map((row) => row.id)).toEqual(['c', 'b', 'a']);
  });

  it('leaves the original order when the sort field does not exist', () => {
    const sorted = applyTableQuery(rows, { ...base, sort: 'missing', pageSize: 10 }, ['name']);
    expect(sorted.items.map((row) => row.id)).toEqual(['b', 'a', 'c']);
  });

  it('returns the requested page and the full total', () => {
    const result = applyTableQuery(rows, { ...base, sort: 'amount', page: 2, pageSize: 2 }, [
      'name',
    ]);
    expect(result.total).toBe(3);
    expect(result.page).toBe(2);
    expect(result.items.map((row) => row.amount)).toEqual([100]);
  });

  it('clamps a page that is past the end', () => {
    const result = applyTableQuery(rows, { ...base, page: 9, pageSize: 2 }, ['name']);
    expect(result.page).toBe(2);
    expect(result.items).toHaveLength(1);
  });

  it('returns an empty page when nothing matches', () => {
    const result = applyTableQuery(rows, { ...base, q: 'zzzz' }, ['name']);
    expect(result).toEqual({ items: [], total: 0, page: 1, pageSize: 2 });
  });
});
