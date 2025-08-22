import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateBalanceDto {
  @ApiProperty({ description: 'Balance increment amount' })
  @IsNumber()
  increment: number;
}

export class UpdateBalanceResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Updated balance' })
  balance: number;
}
