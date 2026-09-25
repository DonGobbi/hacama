import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscribeDto } from './subscribers.dto';
import { SubscribersService } from './subscribers.service';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Post()
  subscribe(@Body() dto: SubscribeDto) {
    return this.subscribersService.subscribe(dto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.subscribersService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.subscribersService.remove(id);
  }
}
