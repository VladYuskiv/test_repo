import { Logger, Module } from '@nestjs/common';
import { EnvironmentModule, EnvironmentVariables } from '@env';
import { SwaggerModule } from '@nestjs/swagger';
import { ProductsModule } from './products/products.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Product from '@/products/models/product.model';
import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { ExceptionFiltersModule } from '@common/filters/exception-filters.module';
import User from '@/users/models/user.model';

const databaseLogger = new Logger('Database');

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        username: config.get('POSTGRES_USER', { infer: true }),
        password: config.get('POSTGRES_PASSWORD', { infer: true }),
        database: config.get('POSTGRES_DB', { infer: true }),
        host: config.get('POSTGRES_HOST', { infer: true }),
        port: config.get('POSTGRES_PORT', { infer: true }),
        dialect: 'postgres',
        synchronize: false,
        autoLoadModels: true,
        models: [Product, User],
        logging: (message) => databaseLogger.debug(message),
      }),
      inject: [ConfigService],
    }),
    EnvironmentModule,
    SwaggerModule,
    AuthModule,
    ProductsModule,
    UsersModule,
    ExceptionFiltersModule,
  ],
})
export class AppModule {}
