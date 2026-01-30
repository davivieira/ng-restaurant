import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TablesService } from './tables.service';
import { environment } from '../../../../environments/environment';

describe('TablesService', () => {
  let service: TablesService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/tables`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TablesService],
    });
    service = TestBed.inject(TablesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getTables calls GET /tables', () => {
    const tables = [{ id: 't1', restaurantId: 'r1', name: 'Table 1', status: 'free', currentWaiterId: null }];
    service.getTables().subscribe((res) => expect(res).toEqual(tables));
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush(tables);
  });

  it('createTable calls POST /tables', () => {
    const dto = { name: 'Table 2' };
    const table = { id: 't2', restaurantId: 'r1', name: dto.name, status: 'free', currentWaiterId: null };
    service.createTable(dto).subscribe((res) => expect(res).toEqual(table));
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(table);
  });

  it('updateTable calls PATCH /tables/:id', () => {
    const dto = { status: 'occupied' as const };
    const table = { id: 't1', restaurantId: 'r1', name: 'Table 1', status: 'occupied', currentWaiterId: null };
    service.updateTable('t1', dto).subscribe((res) => expect(res).toEqual(table));
    const req = httpMock.expectOne(`${base}/t1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush(table);
  });

  it('deleteTable calls DELETE /tables/:id', () => {
    service.deleteTable('t1').subscribe();
    const req = httpMock.expectOne(`${base}/t1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
