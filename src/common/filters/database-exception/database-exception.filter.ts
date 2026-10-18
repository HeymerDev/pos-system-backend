import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';

// Postgres error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
@Catch(QueryFailedError)
export class DatabaseExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const httpException = this.toHttpException(exception);
    if (!httpException) {
      // Unknown database error: keep Nest's default 500 handling and logging
      return super.catch(exception, host);
    }

    this.logger.warn(exception.message);
    return super.catch(httpException, host);
  }

  private toHttpException(exception: QueryFailedError): HttpException | null {
    const { code, detail } = exception.driverError as {
      code?: string;
      detail?: string;
    };

    switch (code) {
      case '23505': // unique_violation
        return new ConflictException(['The record already exists']);
      case '23503': // foreign_key_violation
        return detail?.includes('is still referenced')
          ? new ConflictException([
              'The record is in use and cannot be deleted',
            ])
          : new BadRequestException(['A related record does not exist']);
      case '22003': // numeric_value_out_of_range
        return new BadRequestException(['A numeric value is out of range']);
      case '22P02': // invalid_text_representation
      case '23502': // not_null_violation
        return new BadRequestException(['Invalid data']);
      default:
        return null;
    }
  }
}
