import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrdersService } from './orders.service';
import { environment } from '../../../../environments/environment';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/orders`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrdersService],
    });
    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getOrdersByTable calls GET /orders?tableId=:id', () => {
    const orders = [{ id: 'o1', restaurantId: 'r1', tableId: 't1', waiterId: 'w1', status: 'pending', items: [] }];
    service.getOrdersByTable('t1').subscribe((res) => expect(res).toEqual(orders));
    const req = httpMock.expectOne(`${base}?tableId=t1`);
    expect(req.request.method).toBe('GET');
    req.flush(orders);
  });

  it('createOrder calls POST /orders', () => {
    const dto = { tableId: 't1', items: [{ dishId: 'd1', quantity: 2 }] };
    const order = { id: 'o1', restaurantId: 'r1', tableId: 't1', waiterId: 'w1', status: 'pending', items: [] };
    service.createOrder(dto).subscribe((res) => expect(res).toEqual(order));
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(order);
  });

  it('cancelOrder calls PATCH /orders/:id/cancel', () => {
    const order = { id: 'o1', restaurantId: 'r1', tableId: 't1', waiterId: 'w1', status: 'cancelled', items: [] };
    service.cancelOrder('o1').subscribe((res) => expect(res).toEqual(order));
    const req = httpMock.expectOne(`${base}/o1/cancel`);
    expect(req.request.method).toBe('PATCH');
    req.flush(order);
  });
});
