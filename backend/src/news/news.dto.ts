import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { toBoolean } from '../common/uploads';

export class CreateNewsDto {
  @IsString()
  @MinLength(4)
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(400)
  summary: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  body?: string;

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

export class UpdateNewsDto extends PartialType(CreateNewsDto) {
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  removeImage?: boolean;
}
