import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { Chart, type ChartConfiguration } from 'chart.js/auto';

export interface ChartSeries {
  label: string;
  data: number[];
  color: string;
  colors?: string[];
}

Chart.defaults.font.family = '"Source Sans 3", "Segoe UI", sans-serif';
Chart.defaults.color = '#334155';

@Component({
  selector: 'app-chart-card',
  templateUrl: './chart-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartCard {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly type = input.required<'line' | 'doughnut'>();
  readonly labels = input.required<string[]>();
  readonly series = input.required<ChartSeries[]>();

  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    effect((onCleanup) => {
      const element = this.canvas()?.nativeElement;
      if (!element) {
        return;
      }

      const chart = new Chart(element, this.configuration());
      onCleanup(() => chart.destroy());
    });
  }

  private configuration(): ChartConfiguration {
    const type = this.type();
    const series = this.series();
    const currency = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });

    return {
      type,
      data: {
        labels: this.labels(),
        datasets: series.map((item) => ({
          label: item.label,
          data: item.data,
          borderColor: type === 'doughnut' ? '#ffffff' : item.color,
          backgroundColor:
            type === 'line' ? withAlpha(item.color, 0.16) : (item.colors ?? item.color),
          borderWidth: 2,
          fill: type === 'line',
          tension: 0.35,
          pointRadius: type === 'line' ? 3 : 0,
          pointHoverRadius: type === 'line' ? 5 : 0,
          pointBackgroundColor: item.color,
          hoverOffset: 6,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: type === 'doughnut',
            position: 'bottom',
            labels: { boxWidth: 10, usePointStyle: true, pointStyle: 'circle' },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const raw = typeof context.raw === 'number' ? context.raw : 0;
                return ` ${context.dataset.label ?? 'Value'}: ${currency.format(raw)}`;
              },
            },
          },
        },
        scales:
          type === 'doughnut'
            ? undefined
            : {
                x: { grid: { display: false }, ticks: { color: '#64748b' } },
                y: {
                  beginAtZero: true,
                  grid: { color: '#e2e8f0' },
                  ticks: {
                    color: '#64748b',
                    callback: (value) =>
                      typeof value === 'number' ? currency.format(value) : `${value}`,
                  },
                },
              },
      },
    };
  }
}

function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
