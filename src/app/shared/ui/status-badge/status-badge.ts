import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const TONES: Record<string, string> = {
  paid: 'positive',
  shipped: 'info',
  pending: 'warning',
  refunded: 'danger',
  vip: 'info',
  returning: 'positive',
  new: 'warning',
};

const LABELS: Record<string, string> = {
  paid: 'Paid',
  shipped: 'Shipped',
  pending: 'Pending',
  refunded: 'Refunded',
  vip: 'VIP',
  returning: 'Returning',
  new: 'New',
};

@Component({
  selector: 'app-status-badge',
  template: '{{ label() }}',
  host: {
    class: 'badge',
    '[attr.data-tone]': 'tone()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  readonly value = input.required<string>();
  readonly label = computed(() => LABELS[this.value()] ?? this.value());
  readonly tone = computed(() => TONES[this.value()] ?? 'neutral');
}
