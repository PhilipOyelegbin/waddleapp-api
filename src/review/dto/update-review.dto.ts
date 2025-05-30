import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @ApiPropertyOptional({
    description: 'Verify review',
    example: true,
  })
  @IsBoolean({ message: 'Verified must a boolean value' })
  @IsOptional()
  verified: boolean;
}
