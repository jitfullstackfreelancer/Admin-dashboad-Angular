import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Kpi } from '../../models/dashboard';

@Component({
  selector: 'app-stat-card',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './stat-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  readonly kpi = input.required<Kpi>();
  readonly signedDelta = computed(() => {
    const delta = this.kpi().delta;
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(1)}%`;
  });
}
