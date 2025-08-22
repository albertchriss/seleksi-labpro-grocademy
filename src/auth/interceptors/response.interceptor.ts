import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_RESPONSE_INTERCEPTOR } from '../decorators/skip-response-interceptor.decorator';

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
export class ResponseInterceptor<T>
  implements NestInterceptor<T, Response<T> | T>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T> | T> {
    // Check if the route has the skip interceptor decorator
    const skipInterceptor = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_INTERCEPTOR,
      [context.getHandler(), context.getClass()],
    );

    return next.handle().pipe(
      map((data: any) => {
        // If this route should skip the interceptor, return data as-is
        if (skipInterceptor) {
          return data as T;
        }

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
          } as Response<T>;
        }

        // Regular response without pagination
        return {
          status: 'success',
          message: 'Operation completed successfully',
          data: data as T,
        } as Response<T>;
      }),
    );
  }
}
