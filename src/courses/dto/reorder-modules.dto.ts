import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ModuleOrderItemDto {
  @ApiProperty({ description: 'Module ID' })
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Module order' })
  @IsNotEmpty()
  order: number;
}

export class ReorderModulesDto {
  @ApiProperty({
    description: 'Array of module order items',
    type: [ModuleOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleOrderItemDto)
  module_order: ModuleOrderItemDto[];
}

export class ReorderModulesResponseDto {
  @ApiProperty({
    description: 'Array of reordered module items',
    type: [ModuleOrderItemDto],
    nullable: true,
  })
  module_order: ModuleOrderItemDto[] | null;
}
