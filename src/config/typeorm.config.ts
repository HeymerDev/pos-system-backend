import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get('DATABASE_URL'),
  autoLoadEntities: true,
  synchronize: true,
  ssl: true,
  logging: true,
  entities: [join(import.meta.dirname, '..', '**', '*.entity.{ts,js}')],
});
