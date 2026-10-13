import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { cachedGet, LoadState } from '../../core/http/cached-get';
import { Customer } from '../../shared/models/dashboard';

export const CUSTOMERS_URL = 'assets/data/customers.json';

const initialState: LoadState<Customer[]> = { status: 'loading', data: null };

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly http = inject(HttpClient);
  readonly customers$ = cachedGet<Customer[]>(this.http, CUSTOMERS_URL);
  readonly state = toSignal(this.customers$, { initialValue: initialState });
}
