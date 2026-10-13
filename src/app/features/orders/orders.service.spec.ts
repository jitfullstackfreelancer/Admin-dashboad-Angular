import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Order } from '../../shared/models/dashboard';
import { ORDERS_URL, OrdersService } from './orders.service';

const sample: Order[] = [
  {
    id: 'ORD-2400',
    customer: 'Priya Shah',
    email: 'priya.shah@example.com',
    date: '2026-10-11T00:00:00',
    status: 'paid',
    amount: 186,
    channel: 'Online',
  },
];

describe('OrdersService', () => {
  let service: OrdersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrdersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads orders json once and caches it', () => {
    const req = http.expectOne(ORDERS_URL);
    expect(req.request.method).toBe('GET');
    req.flush(sample);
    expect(service.state()).toEqual({ status: 'ready', data: sample });

    service.orders$.subscribe();
    http.expectNone(ORDERS_URL);
  });

  it('reports an error when the file cannot be loaded', () => {
    http.expectOne(ORDERS_URL).flush('missing', { status: 500, statusText: 'Server Error' });
    expect(service.state()).toEqual({ status: 'error', data: null });
  });
});
