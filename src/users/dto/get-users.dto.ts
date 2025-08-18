import { ApiProperty } from '@nestjs/swagger';

export class UserListItemDto {
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
}

export class PaginationDto {
  @ApiProperty({ description: 'Current page number' })
  current_page: number;

  @ApiProperty({ description: 'Total number of pages' })
  total_pages: number;

  @ApiProperty({ description: 'Total number of items' })
  total_items: number;
}

export class GetUsersResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [UserListItemDto],
    nullable: true,
  })
  data: UserListItemDto[] | null;

  @ApiProperty({ description: 'Pagination information' })
  pagination: PaginationDto;
}
