import { Body, Controller, Get, Ip, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser, JwtUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: JwtUser) {
    return this.activityService.findFor(user);
  }

  @Get('visits')
  @UseGuards(JwtAuthGuard)
  visits() {
    return this.activityService.findVisits();
  }

  @Post('visit')
  recordVisit(@Ip() ip: string, @Req() req: Request, @Body() body?: { path?: string }) {
    return this.activityService.logVisit(ip, req.headers['user-agent'] ?? '', body?.path ?? '/');
  }
}
