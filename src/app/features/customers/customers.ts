import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { createListQuery } from '../../shared/list-query';
import { readChoice, TableQuery } from '../../shared/table-query';
import { CustomerSegment } from '../../shared/models/dashboard';
import { DataTable, TableColumn } from '../../shared/ui/data-table/data-table';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StateMessage } from '../../shared/ui/state-message/state-message';
import { CustomersService } from './customers.service';

const SEGMENTS = ['new', 'returning', 'vip'] as const;

@Component({
  selector: 'app-customers',
  imports: [PageHeader, DataTable, StateMessage, MatFormFieldModule, MatSelectModule],
  templateUrl: './customers.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Customers {
  private readonly customersService = inject(CustomersService);
  private readonly list = createListQuery('-spend');

  readonly customers = computed(() => this.customersService.state().data);
  readonly loadError = computed(() => this.customersService.state().status === 'error');
  readonly query = this.list.query;
  readonly segment = computed(() => readChoice(this.list.params(), 'segment', SEGMENTS));
  readonly filtered = computed(() => {
    const rows = this.customers() ?? [];
    const segment = this.segment();
    return segment === 'all' ? rows : rows.filter((customer) => customer.segment === segment);
  });

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Customer', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'segment', label: 'Segment', sortable: true, format: 'badge' },
    { key: 'orders', label: 'Orders', sortable: true, format: 'number', align: 'end' },
    { key: 'spend', label: 'Spend', sortable: true, format: 'currency', align: 'end' },
    { key: 'joined', label: 'Joined', sortable: true, format: 'date' },
  ];
  readonly searchKeys = ['name', 'email', 'region', 'segment'];
  readonly segmentOptions: { value: 'all' | CustomerSegment; label: string }[] = [
    { value: 'all', label: 'All segments' },
    { value: 'new', label: 'New' },
    { value: 'returning', label: 'Returning' },
    { value: 'vip', label: 'VIP' },
  ];

  protected onQueryChange(next: TableQuery): void {
    this.list.write(
      next,
      { segment: this.segment() === 'all' ? null : this.segment() },
      next.q !== this.query().q,
    );
  }

  protected onSegmentChange(segment: string): void {
    this.list.write({ ...this.query(), page: 1 }, { segment: segment === 'all' ? null : segment });
  }
}
