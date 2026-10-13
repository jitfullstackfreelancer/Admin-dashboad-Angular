import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { cachedGet, LoadState } from '../../core/http/cached-get';
import { Order } from '../../shared/models/dashboard';

export const ORDERS_URL = 'assets/data/orders.json';

const initialState: LoadState<Order[]> = { status: 'loading', data: null };

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  readonly orders$ = cachedGet<Order[]>(this.http, ORDERS_URL);
  readonly state = toSignal(this.orders$, { initialValue: initialState });
}
