import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AdminAuth } from 'src/auth/decorators/auth.decorator';
import { GetUsersResponseDto } from './dto/get-users.dto';
import {
  UpdateBalanceDto,
  UpdateBalanceResponseDto,
} from './dto/update-balance.dto';
import { GetUserResponseDto } from './dto/get-user.dto';
import { UpdateUserDto, UpdateUserResponseDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @AdminAuth()
  @Get()
  @ApiOperation({ summary: 'Get all users with search and pagination' })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search by username, first name, last name, or email',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 15, max: 50)',
  })
  async findAll(
    @Query('q') q: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<GetUsersResponseDto> {
    if (!page) page = 1;
    if (page < 1) page = 1;
    if (!limit) limit = 15;
    if (limit > 50) limit = 50;
    if (limit < 1) limit = 1;
    if (!q) q = '';

    return this.usersService.findUsersWithPagination(q, page, limit);
  }

  @AdminAuth()
  @Post(':id/balance')
  @ApiOperation({ summary: 'Update user balance' })
  @ApiBody({
    description: 'Balance increment data',
    type: UpdateBalanceDto,
  })
  async updateBalance(
    @Param('id') id: string,
    @Body() updateBalanceDto: UpdateBalanceDto,
  ): Promise<UpdateBalanceResponseDto | null> {
    return this.usersService.updateUserBalance(id, updateBalanceDto);
  }

  @AdminAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string): Promise<GetUserResponseDto | null> {
    return this.usersService.findUserById(id);
  }

  @AdminAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Update user (admin cannot be updated)' })
  @ApiBody({
    description: 'User update data',
    type: UpdateUserDto,
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto | null> {
    const result = await this.usersService.updateUser(id, updateUserDto);
    if (!result) {
      throw new NotFoundException('User not found or cannot update admin');
    }
    return result;
  }

  @AdminAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (admin cannot be deleted)' })
  async deleteUser(@Param('id') id: string): Promise<void> {
    const result = await this.usersService.deleteUser(id);
    if (!result) {
      throw new BadRequestException(
        'User not found or cannot delete admin user',
      );
    }
  }
}
