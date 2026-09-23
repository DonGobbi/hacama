import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { EnquiryStatus, EnquiryType } from './enquiry.schema';

export class EnquiryItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  quantity?: string;
}

export class CreateEnquiryDto {
  @IsEnum(EnquiryType)
  type: EnquiryType;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  organization?: string;

  @IsEmail()
  email: string;

  @ValidateIf((o: CreateEnquiryDto) => o.type === EnquiryType.Quote || !!o.phone)
  @IsString()
  @MinLength(6)
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

  @ValidateIf((o: CreateEnquiryDto) => o.type === EnquiryType.Contact || !!o.message)
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message?: string;

  @ValidateIf((o: CreateEnquiryDto) => o.type === EnquiryType.Quote)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => EnquiryItemDto)
  items?: EnquiryItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  deliveryLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  neededBy?: string;

  @IsOptional()
  @IsString()
  website?: string;
}

export class UpdateEnquiryDto {
  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class EnquiryQueryDto {
  @IsOptional()
  @IsEnum(EnquiryType)
  type?: EnquiryType;

  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;
}
