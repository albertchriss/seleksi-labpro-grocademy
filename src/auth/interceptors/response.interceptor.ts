import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page number' })
  current_page: number;

  @ApiProperty({ description: 'Total number of items' })
  total_items: number;

  @ApiProperty({ description: 'Total number of pages' })
  total_pages: number;
}

export interface Response<T> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
  pagination?: PaginationMetaDto;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetaDto;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Check if data contains pagination info
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'pagination' in data
        ) {
          const paginatedData = data as PaginatedResponse<any>;
          return {
            status: 'success',
            message: 'Operation completed successfully',
            data: paginatedData.data as T,
            pagination: paginatedData.pagination,
          };
        }

        // Regular response without pagination
        return {
          status: 'success',
          message: 'Operation completed successfully',
          data: data as T,
        };
      }),
    );
  }
}
