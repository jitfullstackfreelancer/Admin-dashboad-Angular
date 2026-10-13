import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { applyTableQuery, TableQuery } from '../../table-query';
import { StatusBadge } from '../status-badge/status-badge';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'start' | 'end';
  format?: 'text' | 'currency' | 'date' | 'number' | 'badge';
}

@Component({
  selector: 'app-data-table',
  imports: [MatTableModule, MatPaginatorModule, CurrencyPipe, DatePipe, DecimalPipe, StatusBadge],
  templateUrl: './data-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable {
  readonly rows = input.required<readonly object[]>();
  readonly columns = input.required<readonly TableColumn[]>();
  readonly query = input.required<TableQuery>();
  readonly searchKeys = input<readonly string[]>([]);
  readonly caption = input('Data table');
  readonly searchPlaceholder = input('Search');
  readonly emptyMessage = input('No results found.');
  readonly searchable = input(true);
  readonly pageable = input(true);
  readonly queryChange = output<TableQuery>();

  private readonly searchBox = viewChild<ElementRef<HTMLInputElement>>('search');
  private readonly destroyRef = inject(DestroyRef);
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  readonly displayedColumns = computed(() => this.columns().map((column) => column.key));
  readonly result = computed(() => applyTableQuery(this.rows(), this.query(), this.searchKeys()));

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.searchTimer));
    effect(() => {
      const term = this.query().q;
      const input = this.searchBox()?.nativeElement;
      if (input && document.activeElement !== input && input.value !== term) {
        input.value = term;
      }
    });
  }

  protected onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      const current = this.query();
      const q = term.trim();
      if (q === current.q.trim()) {
        return;
      }
      this.queryChange.emit({ ...current, q, page: 1 });
    }, 200);
  }

  protected toggleSort(key: string): void {
    const current = this.query();
    const active = current.sort.startsWith('-') ? current.sort.slice(1) : current.sort;
    const descending = current.sort.startsWith('-');
    const sort = active === key && !descending ? `-${key}` : key;
    this.queryChange.emit({ ...current, sort, page: 1 });
  }

  protected ariaSort(key: string): 'ascending' | 'descending' | 'none' {
    const sort = this.query().sort;
    const active = sort.startsWith('-') ? sort.slice(1) : sort;
    if (active !== key) {
      return 'none';
    }
    return sort.startsWith('-') ? 'descending' : 'ascending';
  }

  protected onPage(event: PageEvent): void {
    const current = this.query();
    const page = event.pageSize === current.pageSize ? event.pageIndex + 1 : 1;
    this.queryChange.emit({ ...current, page, pageSize: event.pageSize });
  }

  protected text(row: object, key: string): string {
    const value = (row as Record<string, unknown>)[key];
    return value == null ? '' : String(value);
  }

  protected amount(row: object, key: string): number {
    return Number((row as Record<string, unknown>)[key] ?? 0);
  }
}
