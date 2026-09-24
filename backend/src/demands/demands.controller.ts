import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { optionalImage } from '../common/uploads';
import { CreateDemandDto, UpdateDemandDto } from './demands.dto';
import { DemandsService } from './demands.service';

@Controller('demands')
export class DemandsController {
  constructor(private readonly demandsService: DemandsService) {}

  @Get()
  findPublished() {
    return this.demandsService.findPublished();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.demandsService.findPublicBySlug(slug);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.demandsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() dto: CreateDemandDto, @UploadedFile(optionalImage()) image?: Express.Multer.File) {
    return this.demandsService.create(dto, image);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  update(@Param('id') id: string, @Body() dto: UpdateDemandDto, @UploadedFile(optionalImage()) image?: Express.Multer.File) {
    return this.demandsService.update(id, dto, image);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.demandsService.remove(id);
  }
}
