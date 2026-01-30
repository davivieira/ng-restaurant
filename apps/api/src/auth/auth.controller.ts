import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  AuthService,
  AuthResponse,
  CreateWaiterResponse,
} from './auth.service';
import { CurrentUser } from './current-user.decorator';
import type { RequestUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateWaiterDto } from './dto/create-waiter.dto';
import { Public } from './public.decorator';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get('waiters')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async listWaiters(
    @CurrentUser() user: RequestUser,
  ): Promise<AuthResponse['user'][]> {
    return this.authService.findWaitersByRestaurant(user.restaurantId);
  }

  @Post('waiters')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createWaiter(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateWaiterDto,
  ): Promise<CreateWaiterResponse> {
    return this.authService.createWaiter(user.restaurantId, dto);
  }
}
