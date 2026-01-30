import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TeamPage } from './team.page';
import { AuthService } from '../../../auth/data/auth.service';

describe('TeamPage', () => {
  let getStaffMock: ReturnType<typeof vi.fn>;
  let createStaffMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getStaffMock = vi.fn().mockReturnValue(of([]));
    createStaffMock = vi.fn();
    TestBed.configureTestingModule({
      imports: [TeamPage],
      providers: [
        {
          provide: AuthService,
          useValue: { getStaff: getStaffMock, createStaff: createStaffMock },
        },
      ],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TeamPage);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads waiters and kitchen on init', () => {
    const fixture = TestBed.createComponent(TeamPage);
    fixture.detectChanges();
    expect(getStaffMock).toHaveBeenCalledWith('waiter');
    expect(getStaffMock).toHaveBeenCalledWith('kitchen');
  });

  it('onSubmit calls createStaff and updates list on success', () => {
    const newUser = { id: 'u2', name: 'Jane', email: 'j@test.com', role: 'waiter', restaurantId: 'r1' };
    createStaffMock.mockReturnValue(of({ user: newUser, temporaryPassword: 'temp123' }));
    const fixture = TestBed.createComponent(TeamPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.name.set('Jane');
    comp.email.set('j@test.com');
    comp.role.set('waiter');
    comp.onSubmit();
    expect(createStaffMock).toHaveBeenCalledWith('Jane', 'j@test.com', 'waiter');
    expect(comp.waiters()).toContainEqual(newUser);
    expect(comp.created()?.email).toBe('j@test.com');
  });

  it('onSubmit sets error when name and email empty', () => {
    const fixture = TestBed.createComponent(TeamPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.name.set('');
    comp.email.set('j@test.com');
    comp.onSubmit();
    expect(comp.error()).toBe('Name and email are required.');
    expect(createStaffMock).not.toHaveBeenCalled();
  });

  it('onSubmit sets error on createStaff failure', () => {
    createStaffMock.mockReturnValue(throwError(() => ({ error: { message: 'Email taken' } })));
    const fixture = TestBed.createComponent(TeamPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.name.set('Jane');
    comp.email.set('j@test.com');
    comp.onSubmit();
    expect(comp.error()).toBe('Email taken');
  });
});
