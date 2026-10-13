import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Customer } from '../../shared/models/dashboard';
import { CUSTOMERS_URL, CustomersService } from './customers.service';

const sample: Customer[] = [
  {
    id: 'CUS-1001',
    name: 'Priya Shah',
    email: 'priya.shah@example.com',
    region: 'Asia Pacific',
    segment: 'vip',
    orders: 28,
    spend: 14620,
    joined: '2024-03-12T00:00:00',
  },
];

describe('CustomersService', () => {
  let service: CustomersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CustomersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads customers json once and caches it', () => {
    const req = http.expectOne(CUSTOMERS_URL);
    expect(req.request.method).toBe('GET');
    req.flush(sample);
    expect(service.state()).toEqual({ status: 'ready', data: sample });

    service.customers$.subscribe();
    http.expectNone(CUSTOMERS_URL);
  });

  it('reports an error when the file cannot be loaded', () => {
    http.expectOne(CUSTOMERS_URL).flush('missing', { status: 404, statusText: 'Not Found' });
    expect(service.state()).toEqual({ status: 'error', data: null });
  });
});
