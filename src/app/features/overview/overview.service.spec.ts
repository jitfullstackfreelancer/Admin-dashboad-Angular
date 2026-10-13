import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OverviewData } from '../../shared/models/dashboard';
import { OVERVIEW_URL, OverviewService } from './overview.service';

const sample: OverviewData = {
  kpis: [],
  revenueTrend: [],
  salesByCategory: [],
  recentOrders: [],
  activity: [],
};

describe('OverviewService', () => {
  let service: OverviewService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OverviewService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads overview json once and caches it', () => {
    const req = http.expectOne(OVERVIEW_URL);
    expect(req.request.method).toBe('GET');
    expect(service.state().status).toBe('loading');

    req.flush(sample);
    expect(service.state()).toEqual({ status: 'ready', data: sample });

    let cached = '';
    service.overview$.subscribe((state) => {
      cached = state.status;
    });
    http.expectNone(OVERVIEW_URL);
    expect(cached).toBe('ready');
  });

  it('reports an error when the file cannot be loaded', () => {
    http.expectOne(OVERVIEW_URL).flush('missing', { status: 404, statusText: 'Not Found' });
    expect(service.state()).toEqual({ status: 'error', data: null });
  });
});
