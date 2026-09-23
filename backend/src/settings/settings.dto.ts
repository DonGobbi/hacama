import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class StatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  value: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  label: string;
}

export class CredentialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  detail?: string;
}

export class FaqDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  question: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  answer: string;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  whatsapp?: string;

  @IsOptional()
  @ValidateIf((o: UpdateSettingsDto) => !!o.email)
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  officeHours?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => StatDto)
  stats?: StatDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => CredentialDto)
  credentials?: CredentialDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => FaqDto)
  faqs?: FaqDto[];
}
