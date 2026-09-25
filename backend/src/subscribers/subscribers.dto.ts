import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubscribeDto {
  @IsEmail()
  @MaxLength(160)
  email: string;

  /** Honeypot: bots fill this hidden field; humans never see it. */
  @IsOptional()
  @IsString()
  website?: string;
}
