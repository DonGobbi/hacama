import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { EmploymentType, JobStatus } from './job.schema';

export class CreateJobDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsString()
  @MinLength(10)
  summary: string;

  @IsString()
  @MinLength(20)
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}

export class UpdateJobDto extends PartialType(CreateJobDto) {}

export class JobQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}
