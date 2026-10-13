import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OverviewService } from './overview.service';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatCard } from '../../shared/ui/stat-card/stat-card';
import { ChartCard, ChartSeries } from '../../shared/ui/chart-card/chart-card';
import { DataTable, TableColumn } from '../../shared/ui/data-table/data-table';
import { StateMessage } from '../../shared/ui/state-message/state-message';
import { TableQuery } from '../../shared/table-query';

const CATEGORY_COLORS = ['#0f766e', '#0369a1', '#b45309', '#6d28d9', '#be123c'];

@Component({
  selector: 'app-overview',
  imports: [PageHeader, StatCard, ChartCard, DataTable, StateMessage, DatePipe, RouterLink],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Overview {
  private readonly overviewService = inject(OverviewService);

  readonly overview = computed(() => this.overviewService.state().data);
  readonly loadError = computed(() => this.overviewService.state().status === 'error');
  readonly recentQuery = signal<TableQuery>({ q: '', sort: '-date', page: 1, pageSize: 5 });

  readonly recentColumns: TableColumn[] = [
    { key: 'id', label: 'Order', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'date', label: 'Date', sortable: true, format: 'date' },
    { key: 'status', label: 'Status', sortable: true, format: 'badge' },
    { key: 'amount', label: 'Amount', sortable: true, format: 'currency', align: 'end' },
  ];

  readonly revenueLabels = computed(
    () => this.overview()?.revenueTrend.map((point) => point.month) ?? [],
  );
  readonly revenueSeries = computed<ChartSeries[]>(() => [
    {
      label: 'Revenue',
      data: this.overview()?.revenueTrend.map((point) => point.revenue) ?? [],
      color: '#0f766e',
    },
  ]);
  readonly categoryLabels = computed(
    () => this.overview()?.salesByCategory.map((item) => item.category) ?? [],
  );
  readonly categorySeries = computed<ChartSeries[]>(() => [
    {
      label: 'Sales',
      data: this.overview()?.salesByCategory.map((item) => item.amount) ?? [],
      color: CATEGORY_COLORS[0],
      colors: CATEGORY_COLORS,
    },
  ]);
}
