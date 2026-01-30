import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { User, UserRole } from '../entities/user.entity';
import { AuthService } from './auth.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateWaiterDto } from './dto/create-waiter.dto';
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
            find: jest.fn(),
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

  describe('createWaiter', () => {
    const dto: CreateWaiterDto = {
      name: 'Waiter One',
      email: 'waiter@test.com',
    };
    const savedWaiter = {
      id: 'w1',
      email: 'waiter@test.com',
      passwordHash: 'hashed',
      name: 'Waiter One',
      role: UserRole.WAITER,
      restaurantId: 'rest-1',
      createdAt: new Date(),
    } as User;

    it('should create waiter and return user with temporaryPassword', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(null);
      (userRepo.create as jest.Mock).mockReturnValue(savedWaiter);
      (userRepo.save as jest.Mock).mockResolvedValue(savedWaiter);

      const result = await service.createWaiter('rest-1', dto);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'waiter@test.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'waiter@test.com',
          name: 'Waiter One',
          role: UserRole.WAITER,
          restaurantId: 'rest-1',
        }),
      );
      expect(result.user).toEqual({
        id: savedWaiter.id,
        email: savedWaiter.email,
        name: savedWaiter.name,
        role: savedWaiter.role,
        restaurantId: savedWaiter.restaurantId,
      });
      expect(result.temporaryPassword).toBeDefined();
      expect(typeof result.temporaryPassword).toBe('string');
    });

    it('should throw ConflictException when email already registered', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.createWaiter('rest-1', dto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createWaiter('rest-1', dto)).rejects.toThrow(
        'Email already registered',
      );
      expect(userRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('createStaff', () => {
    const dtoWaiter: CreateStaffDto = {
      name: 'Staff One',
      email: 'staff@test.com',
      role: UserRole.WAITER,
    };
    const dtoKitchen: CreateStaffDto = {
      name: 'Chef One',
      email: 'chef@test.com',
      role: UserRole.KITCHEN,
    };
    const savedStaff = {
      id: 's1',
      email: 'staff@test.com',
      passwordHash: 'hashed',
      name: 'Staff One',
      role: UserRole.WAITER,
      restaurantId: 'rest-1',
      createdAt: new Date(),
    } as User;

    it('should create staff with waiter role', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(null);
      (userRepo.create as jest.Mock).mockReturnValue(savedStaff);
      (userRepo.save as jest.Mock).mockResolvedValue(savedStaff);

      const result = await service.createStaff('rest-1', dtoWaiter);

      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.WAITER }),
      );
      expect(result.user.role).toBe(UserRole.WAITER);
    });

    it('should create staff with kitchen role', async () => {
      const kitchenUser = { ...savedStaff, role: UserRole.KITCHEN };
      (userRepo.findOne as jest.Mock).mockResolvedValue(null);
      (userRepo.create as jest.Mock).mockReturnValue(kitchenUser);
      (userRepo.save as jest.Mock).mockResolvedValue(kitchenUser);

      const result = await service.createStaff('rest-1', dtoKitchen);

      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.KITCHEN }),
      );
      expect(result.user.role).toBe(UserRole.KITCHEN);
    });

    it('should throw ConflictException when email already registered', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.createStaff('rest-1', dtoWaiter)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('findWaitersByRestaurant', () => {
    it('should return waiters for restaurant', async () => {
      const waiters = [
        {
          id: 'w1',
          email: 'w@test.com',
          name: 'Waiter',
          role: UserRole.WAITER,
          restaurantId: 'rest-1',
        },
      ];
      (userRepo.find as jest.Mock).mockResolvedValue(waiters);

      const result = await service.findWaitersByRestaurant('rest-1');

      expect(userRepo.find).toHaveBeenCalledWith({
        where: { restaurantId: 'rest-1', role: UserRole.WAITER },
        order: { name: 'ASC' },
        select: ['id', 'email', 'name', 'role', 'restaurantId'],
      });
      expect(result).toEqual(waiters);
    });
  });

  describe('findStaffByRestaurant', () => {
    it('should return staff filtered by role when role provided', async () => {
      const kitchen = [
        {
          id: 'k1',
          email: 'k@test.com',
          name: 'Chef',
          role: UserRole.KITCHEN,
          restaurantId: 'rest-1',
        },
      ];
      (userRepo.find as jest.Mock).mockResolvedValue(kitchen);

      const result = await service.findStaffByRestaurant(
        'rest-1',
        UserRole.KITCHEN,
      );

      expect(userRepo.find).toHaveBeenCalledWith({
        where: { restaurantId: 'rest-1', role: UserRole.KITCHEN },
        order: { name: 'ASC' },
        select: ['id', 'email', 'name', 'role', 'restaurantId'],
      });
      expect(result).toEqual(kitchen);
    });

    it('should return all staff (waiter and kitchen) when role not provided', async () => {
      const staff = [
        {
          id: 'w1',
          email: 'w@test.com',
          name: 'Waiter',
          role: UserRole.WAITER,
          restaurantId: 'rest-1',
        },
      ];
      (userRepo.find as jest.Mock).mockResolvedValue(staff);

      const result = await service.findStaffByRestaurant('rest-1');

      expect(userRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            restaurantId: 'rest-1',
            role: expect.anything(),
          }),
          order: { name: 'ASC' },
          select: ['id', 'email', 'name', 'role', 'restaurantId'],
        }),
      );
      expect(result).toEqual(staff);
    });
  });
});
