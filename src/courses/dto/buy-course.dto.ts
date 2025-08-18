import { ApiProperty } from '@nestjs/swagger';

export class BuyCourseResponseDto {
  @ApiProperty({ description: 'Course ID that was purchased' })
  course_id: string;

  @ApiProperty({ description: 'User balance after purchase' })
  user_balance: number;

  @ApiProperty({ description: 'Transaction ID' })
  transaction_id: string;
}
