import { Body, Controller, Delete, Get, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { requiredPdf } from '../common/uploads';
import { UpdateSettingsDto } from './settings.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  get() {
    return this.settingsService.get();
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  update(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto);
  }

  @Post('company-profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadCompanyProfile(@UploadedFile(requiredPdf()) file: Express.Multer.File) {
    return this.settingsService.uploadCompanyProfile(file);
  }

  @Delete('company-profile')
  @UseGuards(JwtAuthGuard)
  removeCompanyProfile() {
    return this.settingsService.removeCompanyProfile();
  }
}
