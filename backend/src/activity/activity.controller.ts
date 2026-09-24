import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivityService } from './activity.service';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  findAll(@CurrentUser() user: JwtUser) {
    return this.activityService.findFor(user);
  }
}
