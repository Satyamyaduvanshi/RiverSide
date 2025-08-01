import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStudioDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}