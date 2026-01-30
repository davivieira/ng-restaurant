import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should post to /auth/login with email and password', () => {
    service.login('u@test.com', 'pass').subscribe((res) => {
      expect(res.accessToken).toBe('tok');
      expect(res.user.email).toBe('u@test.com');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'u@test.com', password: 'pass' });
    req.flush({ accessToken: 'tok', user: { id: '1', email: 'u@test.com', name: 'U', role: 'admin', restaurantId: 'r1' } });
  });

  it('should post to /auth/register with name, email, password, restaurantName', () => {
    service
      .register('Name', 'u@test.com', 'password123', 'Restaurant')
      .subscribe((res) => {
        expect(res.accessToken).toBe('tok');
        expect(res.user.name).toBe('Name');
      });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'Name',
      email: 'u@test.com',
      password: 'password123',
      restaurantName: 'Restaurant',
    });
    req.flush({
      accessToken: 'tok',
      user: { id: '1', email: 'u@test.com', name: 'Name', role: 'admin', restaurantId: 'r1' },
    });
  });

  it('should get waiters from GET /auth/waiters', () => {
    const waiters = [
      { id: '2', email: 'w@test.com', name: 'Waiter', role: 'waiter', restaurantId: 'r1' },
    ];
    service.getWaiters().subscribe((res) => {
      expect(res).toEqual(waiters);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/waiters`);
    expect(req.request.method).toBe('GET');
    req.flush(waiters);
  });

  it('should post to /auth/waiters with name and email', () => {
    service.createWaiter('Waiter', 'w@test.com').subscribe((res) => {
      expect(res.user.email).toBe('w@test.com');
      expect(res.user.name).toBe('Waiter');
      expect(res.user.role).toBe('waiter');
      expect(res.temporaryPassword).toBe('temp123');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/waiters`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Waiter', email: 'w@test.com' });
    req.flush({
      user: { id: '2', email: 'w@test.com', name: 'Waiter', role: 'waiter', restaurantId: 'r1' },
      temporaryPassword: 'temp123',
    });
  });

  it('should post to /auth/staff with name, email and role', () => {
    service.createStaff('Kitchen', 'k@test.com', 'kitchen').subscribe((res) => {
      expect(res.user.email).toBe('k@test.com');
      expect(res.user.name).toBe('Kitchen');
      expect(res.user.role).toBe('kitchen');
      expect(res.temporaryPassword).toBe('temp456');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/staff`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Kitchen', email: 'k@test.com', role: 'kitchen' });
    req.flush({
      user: { id: '3', email: 'k@test.com', name: 'Kitchen', role: 'kitchen', restaurantId: 'r1' },
      temporaryPassword: 'temp456',
    });
  });

  it('should get staff from GET /auth/staff with optional role param', () => {
    const staff = [
      { id: '2', email: 'w@test.com', name: 'Waiter', role: 'waiter', restaurantId: 'r1' },
    ];
    service.getStaff('waiter').subscribe((res) => {
      expect(res).toEqual(staff);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/staff?role=waiter`);
    expect(req.request.method).toBe('GET');
    req.flush(staff);
  });

  it('should get all staff from GET /auth/staff when no role', () => {
    const staff = [
      { id: '2', email: 'w@test.com', name: 'Waiter', role: 'waiter', restaurantId: 'r1' },
      { id: '3', email: 'k@test.com', name: 'Kitchen', role: 'kitchen', restaurantId: 'r1' },
    ];
    service.getStaff().subscribe((res) => {
      expect(res).toEqual(staff);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/staff`);
    expect(req.request.method).toBe('GET');
    req.flush(staff);
  });
});
