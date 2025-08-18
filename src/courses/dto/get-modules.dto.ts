import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from 'src/auth/interceptors/response.interceptor';
import { ModuleDetailResponseDto } from 'src/modules/dto/module-detail.dto';

export class GetModulesResponseDto {
  @ApiProperty({
    description: 'List of modules',
    type: [ModuleDetailResponseDto],
    nullable: true,
  })
  data: ModuleDetailResponseDto[] | null;

  @ApiProperty({ description: 'Pagination information' })
  pagination: PaginationMetaDto;
}
