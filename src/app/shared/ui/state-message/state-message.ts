import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-state-message',
  imports: [MatProgressSpinnerModule],
  templateUrl: './state-message.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateMessage {
  readonly message = input.required<string>();
  readonly tone = input<'loading' | 'error'>('loading');
}
