import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';
import { toBoolean } from '../common/uploads';

export class CreatePartnerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Matches(/^(https?:\/\/\S+)?$/, { message: 'website must start with http:// or https://' })
  website?: string;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdatePartnerDto extends PartialType(CreatePartnerDto) {
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  removeImage?: boolean;
}
