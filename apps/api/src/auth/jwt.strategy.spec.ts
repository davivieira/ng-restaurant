import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { UserRole } from '../entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    id: 'user-1',
    email: 'admin@test.com',
    name: 'Admin',
    role: UserRole.ADMIN,
    restaurantId: 'rest-1',
    passwordHash: 'hash',
    restaurant: {},
    createdAt: new Date(),
  };

  const payload = {
    sub: 'user-1',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
    restaurantId: 'rest-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: { validateUser: jest.fn() },
        },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
    authService = module.get(AuthService);
  });

  it('should return user object when validateUser returns user', async () => {
    authService.validateUser.mockResolvedValue(mockUser);

    const result = await strategy.validate(payload);

    expect(authService.validateUser).toHaveBeenCalledWith(payload);
    expect(result).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      restaurantId: mockUser.restaurantId,
      name: mockUser.name,
    });
  });

  it('should throw UnauthorizedException when validateUser returns null', async () => {
    authService.validateUser.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(authService.validateUser).toHaveBeenCalledWith(payload);
  });
});
