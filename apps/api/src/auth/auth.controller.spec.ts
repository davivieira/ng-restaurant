import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthResponse = {
    accessToken: 'jwt-token',
    user: {
      id: 'user-1',
      email: 'admin@test.com',
      name: 'Admin',
      role: UserRole.ADMIN,
      restaurantId: 'rest-1',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  describe('register', () => {
    const dto: RegisterDto = {
      name: 'Admin',
      email: 'admin@test.com',
      password: 'password123',
      restaurantName: 'My Restaurant',
    };

    it('should return auth response from AuthService', async () => {
      authService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    const dto: LoginDto = { email: 'admin@test.com', password: 'password123' };

    it('should return auth response from AuthService', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });
});
