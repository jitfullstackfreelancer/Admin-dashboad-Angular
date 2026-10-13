import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Icon, IconName } from '../../../shared/ui/icon/icon';

const HANDSET_QUERY = '(max-width: 959px)';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
  exact: boolean;
}

@Component({
  selector: 'app-shell',
  imports: [MatSidenavModule, RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly router = inject(Router);
  private readonly breakpoints = inject(BreakpointObserver);

  readonly nav: NavItem[] = [
    { path: '/', label: 'Overview', icon: 'overview', exact: true },
    { path: '/orders', label: 'Orders', icon: 'orders', exact: false },
    { path: '/customers', label: 'Customers', icon: 'customers', exact: false },
  ];

  readonly draft = signal('');
  readonly menuOpen = signal(false);
  private readonly globalSearch = viewChild<ElementRef<HTMLInputElement>>('globalSearch');
  readonly isHandset = toSignal(
    this.breakpoints.observe(HANDSET_QUERY).pipe(map((result) => result.matches)),
    { initialValue: prefersHandset() },
  );
  readonly sidenavOpened = computed(() => (this.isHandset() ? this.menuOpen() : true));

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  constructor() {
    effect(() => {
      const query = this.router.parseUrl(this.url()).queryParams['q'];
      const term = typeof query === 'string' ? query : '';
      this.draft.set(term);
      const input = this.globalSearch()?.nativeElement;
      if (input && document.activeElement !== input && input.value !== term) {
        input.value = term;
      }
      if (this.isHandset()) {
        this.menuOpen.set(false);
      }
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected onSearch(event: Event): void {
    event.preventDefault();
    const term = this.draft().trim();
    void this.router.navigate(['/orders'], {
      queryParams: { q: term || null },
    });
  }

  protected onDraft(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }
}

function prefersHandset(): boolean {
  return (
    typeof globalThis.matchMedia === 'function' && globalThis.matchMedia(HANDSET_QUERY).matches
  );
}
