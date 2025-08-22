import { ApiProperty } from '@nestjs/swagger';

export class GetUserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'First name' })
  first_name: string;

  @ApiProperty({ description: 'Last name' })
  last_name: string;

  @ApiProperty({ description: 'User balance' })
  balance: number;

  @ApiProperty({ description: 'Number of courses purchased' })
  courses_purchased: number;
}
