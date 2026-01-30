import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateWaiterDto } from './dto/create-waiter.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  restaurantId: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    restaurantId: string;
  };
}

export interface CreateWaiterResponse {
  user: AuthResponse['user'];
  temporaryPassword: string;
}

export type CreateStaffResponse = CreateWaiterResponse;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const restaurant = this.restaurantRepo.create({ name: dto.restaurantName });
    const savedRestaurant = await this.restaurantRepo.save(restaurant);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name,
      role: UserRole.ADMIN,
      restaurantId: savedRestaurant.id,
    });
    const savedUser = await this.userRepo.save(user);

    return this.issueAuthResponse(savedUser);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
      relations: ['restaurant'],
    });
    if (!user) {
      throw new UnauthorizedException('User not registered');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'Use the sign-in method you used to register (e.g. Google)',
      );
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Wrong password');
    }
    return this.issueAuthResponse(user);
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id: payload.sub, restaurantId: payload.restaurantId },
    });
  }

  /**
   * Generate a readable temporary password (12 chars, alphanumeric).
   * Excludes ambiguous chars (0/O, 1/l) for easier typing.
   */
  private generateTemporaryPassword(): string {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const bytes = randomBytes(12);
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  async createWaiter(
    restaurantId: string,
    dto: CreateWaiterDto,
  ): Promise<CreateWaiterResponse> {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const temporaryPassword = this.generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    const user = this.userRepo.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name.trim(),
      role: UserRole.WAITER,
      restaurantId,
    });
    const savedUser = await this.userRepo.save(user);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
        restaurantId: savedUser.restaurantId,
      },
      temporaryPassword,
    };
  }

  async findWaitersByRestaurant(
    restaurantId: string,
  ): Promise<AuthResponse['user'][]> {
    return this.findStaffByRestaurant(restaurantId, UserRole.WAITER);
  }

  async createStaff(
    restaurantId: string,
    dto: CreateStaffDto,
  ): Promise<CreateStaffResponse> {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
    const temporaryPassword = this.generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    const user = this.userRepo.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name.trim(),
      role: dto.role,
      restaurantId,
    });
    const savedUser = await this.userRepo.save(user);
    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
        restaurantId: savedUser.restaurantId,
      },
      temporaryPassword,
    };
  }

  async findStaffByRestaurant(
    restaurantId: string,
    role?: UserRole.WAITER | UserRole.KITCHEN,
  ): Promise<AuthResponse['user'][]> {
    const where: FindOptionsWhere<User> = {
      restaurantId,
      role: role ?? In([UserRole.WAITER, UserRole.KITCHEN]),
    };
    const users = await this.userRepo.find({
      where,
      order: { name: 'ASC' },
      select: ['id', 'email', 'name', 'role', 'restaurantId'],
    });
    return users;
  }

  /**
   * Single place to issue JWT and build AuthResponse. Used by register, login,
   * and future providers (e.g. Google). New providers should resolve or create
   * a User and call this method so all flows return the same response shape.
   */
  private issueAuthResponse(user: User): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
      },
    };
  }
}
