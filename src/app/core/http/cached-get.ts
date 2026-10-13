import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, startWith } from 'rxjs/operators';

export interface LoadState<T> {
  status: 'loading' | 'ready' | 'error';
  data: T | null;
}

export function cachedGet<T>(http: HttpClient, url: string): Observable<LoadState<T>> {
  return http.get<T>(url).pipe(
    map((data): LoadState<T> => ({ status: 'ready', data })),
    catchError((): Observable<LoadState<T>> => of({ status: 'error', data: null })),
    startWith<LoadState<T>>({ status: 'loading', data: null }),
    shareReplay({ bufferSize: 1, refCount: false }),
  );
}
