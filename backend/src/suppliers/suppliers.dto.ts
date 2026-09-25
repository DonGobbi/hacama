import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  companyName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  contactPerson: string;

  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  location?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @Type(() => String)
  categories?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  /** Honeypot: bots fill it, humans never see it. */
  @IsOptional()
  @IsString()
  website?: string;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @IsOptional()
  @IsIn(['new', 'contacted', 'approved', 'rejected'])
  status?: 'new' | 'contacted' | 'approved' | 'rejected';
}
