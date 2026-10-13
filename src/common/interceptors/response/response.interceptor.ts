import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { RESPONSE_MESSAGE } from '../../decorators/response-message/response-message.decorator.js';
import { PaginatedResult } from './paginated-result.js';

export interface ApiResponse<T> {
  status: 'success';
  message?: string;
  data: T;
  total?: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<unknown>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<unknown>> {
    const message = this.reflector.get<string | undefined>(
      RESPONSE_MESSAGE,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((result) => {
        if (result instanceof PaginatedResult) {
          return {
            status: 'success',
            message,
            data: result.data,
            total: result.total,
          };
        }

        return { status: 'success', message, data: result };
      }),
    );
  }
}
