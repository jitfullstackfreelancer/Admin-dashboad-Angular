import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { cachedGet, LoadState } from '../../core/http/cached-get';
import { OverviewData } from '../../shared/models/dashboard';

export const OVERVIEW_URL = 'assets/data/overview.json';

const initialState: LoadState<OverviewData> = { status: 'loading', data: null };

@Injectable({ providedIn: 'root' })
export class OverviewService {
  private readonly http = inject(HttpClient);
  readonly overview$ = cachedGet<OverviewData>(this.http, OVERVIEW_URL);
  readonly state = toSignal(this.overview$, { initialValue: initialState });
}
