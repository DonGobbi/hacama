import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { optionalPdf } from '../common/uploads';
import { CreateTenderDto, UpdateTenderDto } from './tenders.dto';
import { TendersService } from './tenders.service';

@Controller('tenders')
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Get()
  findPublished() {
    return this.tendersService.findPublished();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.tendersService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('document'))
  create(@Body() dto: CreateTenderDto, @UploadedFile(optionalPdf()) document?: Express.Multer.File) {
    return this.tendersService.create(dto, document);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('document'))
  update(@Param('id') id: string, @Body() dto: UpdateTenderDto, @UploadedFile(optionalPdf()) document?: Express.Multer.File) {
    return this.tendersService.update(id, dto, document);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.tendersService.remove(id);
  }
}
