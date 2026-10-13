import { computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { readTableQuery, TableQuery } from './table-query';

export function createListQuery(defaultSort: string, initialPageSize = 8) {
  const route = inject(ActivatedRoute);
  const router = inject(Router);
  const pageSize = signal(initialPageSize);
  const params = toSignal(route.queryParamMap, {
    initialValue: convertToParamMap({}),
  });
  const query = computed(() =>
    readTableQuery(params(), { sort: defaultSort, pageSize: pageSize() }),
  );

  function write(
    next: TableQuery,
    extras: Record<string, string | null> = {},
    replaceUrl = false,
  ): void {
    pageSize.set(next.pageSize);
    void router.navigate([], {
      relativeTo: route,
      replaceUrl,
      queryParams: {
        q: next.q.trim() || null,
        sort: next.sort === defaultSort ? null : next.sort,
        page: next.page > 1 ? next.page : null,
        ...extras,
      },
    });
  }

  return { params, query, write };
}
