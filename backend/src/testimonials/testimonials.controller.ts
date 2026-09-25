import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { optionalImage } from '../common/uploads';
import { CreateTestimonialDto, SubmitTestimonialDto, UpdateTestimonialDto } from './testimonials.dto';
import { TestimonialsService } from './testimonials.service';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  findPublished() {
    return this.testimonialsService.findPublished();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.testimonialsService.findAll();
  }

  /** Public "share your experience" submissions: saved unpublished for admin review. */
  @Post('submit')
  submit(@Body() dto: SubmitTestimonialDto) {
    return this.testimonialsService.submit(dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() dto: CreateTestimonialDto, @UploadedFile(optionalImage()) image?: Express.Multer.File) {
    return this.testimonialsService.create(dto, image);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTestimonialDto,
    @UploadedFile(optionalImage()) image?: Express.Multer.File,
  ) {
    return this.testimonialsService.update(id, dto, image);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }
}
