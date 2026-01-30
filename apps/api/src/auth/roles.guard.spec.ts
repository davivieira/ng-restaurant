import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../entities/user.entity';
import type { RequestUser } from './current-user.decorator';
import { ROLES_KEY } from './roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const createMockContext = (user: RequestUser | undefined): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
      ],
    }).compile();

    guard = module.get(RolesGuard);
    reflector = module.get(Reflector);
  });

  it('allows when no roles are required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    const ctx = createMockContext({
      id: 'u1',
      email: 'a@b.com',
      role: UserRole.WAITER,
      restaurantId: 'r1',
      name: 'Waiter',
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows when user role is in required roles', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      UserRole.ADMIN,
    ]);
    const ctx = createMockContext({
      id: 'u1',
      email: 'a@b.com',
      role: UserRole.ADMIN,
      restaurantId: 'r1',
      name: 'Admin',
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies when user role is not in required roles', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      UserRole.ADMIN,
    ]);
    const ctx = createMockContext({
      id: 'u1',
      email: 'a@b.com',
      role: UserRole.WAITER,
      restaurantId: 'r1',
      name: 'Waiter',
    });
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('denies when user is missing', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      UserRole.ADMIN,
    ]);
    const ctx = createMockContext(undefined);
    expect(guard.canActivate(ctx)).toBe(false);
  });
});
