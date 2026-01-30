import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MenuService } from './menu.service';
import { environment } from '../../../../environments/environment';

describe('MenuService', () => {
  let service: MenuService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/menu`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MenuService],
    });
    service = TestBed.inject(MenuService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getCategories calls GET /menu/categories', () => {
    const categories = [{ id: 'c1', restaurantId: 'r1', name: 'Starters' }];
    service.getCategories().subscribe((res) => expect(res).toEqual(categories));
    const req = httpMock.expectOne(`${base}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush(categories);
  });

  it('createCategory calls POST /menu/categories', () => {
    const dto = { name: 'Desserts' };
    const category = { id: 'c2', restaurantId: 'r1', name: dto.name };
    service.createCategory(dto).subscribe((res) => expect(res).toEqual(category));
    const req = httpMock.expectOne(`${base}/categories`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(category);
  });

  it('updateCategory calls PATCH /menu/categories/:id', () => {
    const dto = { name: 'Updated' };
    const category = { id: 'c1', restaurantId: 'r1', name: dto.name };
    service.updateCategory('c1', dto).subscribe((res) => expect(res).toEqual(category));
    const req = httpMock.expectOne(`${base}/categories/c1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush(category);
  });

  it('deleteCategory calls DELETE /menu/categories/:id', () => {
    service.deleteCategory('c1').subscribe();
    const req = httpMock.expectOne(`${base}/categories/c1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getDishes calls GET /menu/dishes without params when no categoryId', () => {
    const dishes = [{ id: 'd1', restaurantId: 'r1', name: 'Soup', description: null, price: '5', categoryId: null, isActive: true }];
    service.getDishes().subscribe((res) => expect(res).toEqual(dishes));
    const req = httpMock.expectOne(`${base}/dishes`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.toString()).toBe('');
    req.flush(dishes);
  });

  it('getDishes calls GET /menu/dishes?categoryId= when categoryId provided', () => {
    const dishes: unknown[] = [];
    service.getDishes('c1').subscribe((res) => expect(res).toEqual(dishes));
    const req = httpMock.expectOne(`${base}/dishes?categoryId=c1`);
    expect(req.request.method).toBe('GET');
    req.flush(dishes);
  });

  it('createDish calls POST /menu/dishes', () => {
    const dto = { name: 'Salad', price: 8, description: '', categoryId: null, isActive: true };
    const dish = { id: 'd2', restaurantId: 'r1', name: dto.name, description: null, price: '8', categoryId: null, isActive: true };
    service.createDish(dto).subscribe((res) => expect(res).toEqual(dish));
    const req = httpMock.expectOne(`${base}/dishes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(dish);
  });

  it('updateDish calls PATCH /menu/dishes/:id', () => {
    const dto = { name: 'Updated' };
    const dish = { id: 'd1', restaurantId: 'r1', name: dto.name, description: null, price: '5', categoryId: null, isActive: true };
    service.updateDish('d1', dto).subscribe((res) => expect(res).toEqual(dish));
    const req = httpMock.expectOne(`${base}/dishes/d1`);
    expect(req.request.method).toBe('PATCH');
    req.flush(dish);
  });

  it('deleteDish calls DELETE /menu/dishes/:id', () => {
    service.deleteDish('d1').subscribe();
    const req = httpMock.expectOne(`${base}/dishes/d1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
