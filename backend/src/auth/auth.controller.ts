import { Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserDocument } from '../users/user.schema';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser, JwtUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(AuthGuard('local'))
  login(@Req() req: Request) {
    return this.authService.login(req.user as UserDocument);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtUser) {
    return this.usersService.findById(user.sub);
  }
}
