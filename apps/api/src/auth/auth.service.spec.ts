import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { User, UserRole } from '../entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let restaurantRepo: jest.Mocked<Repository<Restaurant>>;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 'user-1',
    email: 'admin@test.com',
    passwordHash: 'hashed',
    name: 'Admin',
    role: UserRole.ADMIN,
    restaurantId: 'rest-1',
    restaurant: {
      id: 'rest-1',
      name: 'Test',
      createdAt: new Date(),
      users: [],
    },
    createdAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Restaurant),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('jwt-token') },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    restaurantRepo = module.get(getRepositoryToken(Restaurant));
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    const dto: RegisterDto = {
      name: 'Admin',
      email: 'admin@test.com',
      password: 'password123',
      restaurantName: 'My Restaurant',
    };

    it('should create restaurant and user and return auth response', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(null);
      (restaurantRepo.create as jest.Mock).mockReturnValue({
        name: dto.restaurantName,
      });
      (restaurantRepo.save as jest.Mock).mockResolvedValue({
        id: 'rest-1',
        name: dto.restaurantName,
      });
      (userRepo.create as jest.Mock).mockReturnValue(mockUser);
      (userRepo.save as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.register(dto);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'admin@test.com' },
      });
      expect(restaurantRepo.create).toHaveBeenCalledWith({
        name: dto.restaurantName,
      });
      expect(restaurantRepo.save).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(userRepo.save).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        restaurantId: mockUser.restaurantId,
      });
      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          restaurantId: mockUser.restaurantId,
        },
      });
    });

    it('should throw ConflictException when email already registered', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      await expect(service.register(dto)).rejects.toThrow(
        'Email already registered',
      );
      expect(restaurantRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto: LoginDto = { email: 'admin@test.com', password: 'password123' };

    it('should return auth response when credentials are valid', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login(dto);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'admin@test.com' },
        relations: ['restaurant'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.password,
        mockUser.passwordHash,
      );
      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.id).toBe(mockUser.id);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(dto)).rejects.toThrow('User not registered');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(dto)).rejects.toThrow('Wrong password');
    });

    it('should throw UnauthorizedException when user has no passwordHash (OAuth-only)', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue({
        ...mockUser,
        passwordHash: null,
      });

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(dto)).rejects.toThrow(/sign-in method/);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    const payload = {
      sub: 'user-1',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
      restaurantId: 'rest-1',
    };

    it('should return user when found', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.validateUser(payload);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: payload.sub, restaurantId: payload.restaurantId },
      });
      expect(result).toBe(mockUser);
    });

    it('should return null when user not found', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser(payload);

      expect(result).toBeNull();
    });
  });
});
