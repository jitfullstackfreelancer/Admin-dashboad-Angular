export interface TableQuery {
  q: string;
  sort: string;
  page: number;
  pageSize: number;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QueryParams {
  get(name: string): string | null;
}

export interface TableQueryDefaults {
  sort: string;
  pageSize: number;
}

export function readTableQuery(params: QueryParams, defaults: TableQueryDefaults): TableQuery {
  const pageRaw = Number(params.get('page'));
  return {
    q: params.get('q') ?? '',
    sort: params.get('sort') || defaults.sort,
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize: defaults.pageSize > 0 ? defaults.pageSize : 8,
  };
}

export function readChoice(params: QueryParams, key: string, allowed: readonly string[]): string {
  const value = params.get(key);
  return value && allowed.includes(value) ? value : 'all';
}

export function applyTableQuery<T extends object>(
  rows: readonly T[],
  query: TableQuery,
  searchKeys: readonly string[],
): PageResult<T> {
  const filtered = filterRows(rows, query.q, searchKeys);
  const sorted = sortRows(filtered, query.sort);
  return paginate(sorted, query.page, query.pageSize);
}

function filterRows<T extends object>(
  rows: readonly T[],
  term: string,
  searchKeys: readonly string[],
): T[] {
  const needle = term.trim().toLowerCase();
  if (!needle) {
    return [...rows];
  }

  return rows.filter((row) =>
    searchKeys.some((key) => readable(row, key).toLowerCase().includes(needle)),
  );
}

function sortRows<T extends object>(rows: readonly T[], sort: string): T[] {
  const descending = sort.startsWith('-');
  const key = descending ? sort.slice(1) : sort;
  if (!key) {
    return [...rows];
  }

  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      const leftValue = readField(left.row, key);
      const rightValue = readField(right.row, key);
      if (leftValue == null && rightValue == null) {
        return left.index - right.index;
      }
      if (leftValue == null) {
        return 1;
      }
      if (rightValue == null) {
        return -1;
      }

      const compared = compareValues(leftValue, rightValue);
      const directed = descending ? -compared : compared;
      return directed || left.index - right.index;
    })
    .map((entry) => entry.row);
}

function paginate<T>(rows: readonly T[], page: number, pageSize: number): PageResult<T> {
  const size = pageSize > 0 ? pageSize : 1;
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const start = (current - 1) * size;

  return {
    items: rows.slice(start, start + size),
    total,
    page: current,
    pageSize: size,
  };
}

function readable(row: object, key: string): string {
  const value = readField(row, key);
  return value == null ? '' : String(value);
}

function readField(row: object, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

function compareValues(left: unknown, right: unknown): number {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}
