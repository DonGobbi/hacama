import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { optionalImage } from '../common/uploads';
import { CreateNewsDto, UpdateNewsDto } from './news.dto';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findPublished() {
    return this.newsService.findPublished();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.newsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() dto: CreateNewsDto, @UploadedFile(optionalImage()) image?: Express.Multer.File) {
    return this.newsService.create(dto, image);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  update(@Param('id') id: string, @Body() dto: UpdateNewsDto, @UploadedFile(optionalImage()) image?: Express.Multer.File) {
    return this.newsService.update(id, dto, image);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}
