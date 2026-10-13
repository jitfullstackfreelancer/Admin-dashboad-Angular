import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { createListQuery } from '../../shared/list-query';
import { readChoice, TableQuery } from '../../shared/table-query';
import { OrderStatus } from '../../shared/models/dashboard';
import { DataTable, TableColumn } from '../../shared/ui/data-table/data-table';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StateMessage } from '../../shared/ui/state-message/state-message';
import { OrdersService } from './orders.service';

const ORDER_STATUSES = ['paid', 'pending', 'shipped', 'refunded'] as const;

@Component({
  selector: 'app-orders',
  imports: [PageHeader, DataTable, StateMessage, MatFormFieldModule, MatSelectModule],
  templateUrl: './orders.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Orders {
  private readonly ordersService = inject(OrdersService);
  private readonly list = createListQuery('-date');

  readonly orders = computed(() => this.ordersService.state().data);
  readonly loadError = computed(() => this.ordersService.state().status === 'error');
  readonly query = this.list.query;
  readonly status = computed(() => readChoice(this.list.params(), 'status', ORDER_STATUSES));
  readonly filtered = computed(() => {
    const rows = this.orders() ?? [];
    const status = this.status();
    return status === 'all' ? rows : rows.filter((order) => order.status === status);
  });

  readonly columns: TableColumn[] = [
    { key: 'id', label: 'Order', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'date', label: 'Date', sortable: true, format: 'date' },
    { key: 'channel', label: 'Channel', sortable: true },
    { key: 'status', label: 'Status', sortable: true, format: 'badge' },
    { key: 'amount', label: 'Amount', sortable: true, format: 'currency', align: 'end' },
  ];
  readonly searchKeys = ['id', 'customer', 'email', 'channel', 'status'];
  readonly statusOptions: { value: 'all' | OrderStatus; label: string }[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'refunded', label: 'Refunded' },
  ];

  protected onQueryChange(next: TableQuery): void {
    this.list.write(
      next,
      { status: this.status() === 'all' ? null : this.status() },
      next.q !== this.query().q,
    );
  }

  protected onStatusChange(status: string): void {
    this.list.write({ ...this.query(), page: 1 }, { status: status === 'all' ? null : status });
  }
}
