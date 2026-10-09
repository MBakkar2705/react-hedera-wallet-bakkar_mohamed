import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTopicDto {
  @ApiPropertyOptional({ description: 'Optional memo attached to the topic' })
  @IsOptional()
  @IsString()
  memo?: string;
}
