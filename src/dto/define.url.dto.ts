// src/web-analyzer/dto/create-web-analyzer.dto.ts
import { IsString, IsUrl, IsOptional, IsObject, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// DTO for the nested requestPayload object
export class RequestPayloadDto {
  @IsNotEmpty()
  @IsString()
  type!: string; // Added definite assignment assertion (!)

  @IsNotEmpty()
  @IsString()
  details!: string; // Added definite assignment assertion (!)
}

export class CreateWebAnalysisDto {
  @IsUrl()
  @IsNotEmpty()
  url!: string; // Added definite assignment assertion (!)

  @IsString()
  @IsNotEmpty()
  geminiModel!: string; // Added definite assignment assertion (!)

  @IsOptional()
  @IsString()
  userId?: string; // This remains optional, no '!' needed

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RequestPayloadDto)
  requestPayload!: RequestPayloadDto; // Added definite assignment assertion (!)

  // Assuming 'objectJob' was removed based on previous discussion
  // If it's still in your DTO, you'd handle it similarly (e.g., 'objectJob!: string;' or 'objectJob?: string;')
}