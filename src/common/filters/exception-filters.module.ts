import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { SequelizeExceptionFilter } from '@common/filters/sequelize-exception.filter';

@Module({
  providers: [{ provide: APP_FILTER, useClass: SequelizeExceptionFilter }],
})
export class ExceptionFiltersModule {}
