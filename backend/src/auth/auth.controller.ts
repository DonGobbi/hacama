import { Body, Controller, Get, HttpCode, Ip, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ActivityService } from '../activity/activity.service';
import { UserDocument } from '../users/user.schema';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, UpdateProfileDto } from './auth.dto';
import { AuthService } from './auth.service';
import { CurrentUser, JwtUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly activityService: ActivityService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: Request, @Ip() ip: string) {
    const user = req.user as UserDocument;
    void this.activityService.logLogin(
      { sub: user.id, email: user.email, role: user.role, name: user.name },
      ip,
      req.headers['user-agent'] ?? '',
    );
    void this.usersService.touchLastLogin(user.id);
    return this.authService.login(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtUser) {
    return this.usersService.findById(user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: JwtUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Post('change-password')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  changePassword(@CurrentUser() user: JwtUser, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.sub, dto.currentPassword, dto.newPassword);
  }

  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(dto.token, dto.newPassword);
  }
}
