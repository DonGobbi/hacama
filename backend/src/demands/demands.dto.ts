import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { toBoolean } from '../common/uploads';

export class CreateDemandDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  quantity: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  price?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  details?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  contact?: string;

  @IsOptional()
  @IsIn(['open', 'fulfilled'])
  status?: 'open' | 'fulfilled';

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

export class UpdateDemandDto extends PartialType(CreateDemandDto) {
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  removeImage?: boolean;
}
