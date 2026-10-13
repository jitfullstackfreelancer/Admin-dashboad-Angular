import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName = 'overview' | 'orders' | 'customers' | 'search' | 'menu';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.html',
  host: {
    class: 'icon',
    'aria-hidden': 'true',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<IconName>();
}
