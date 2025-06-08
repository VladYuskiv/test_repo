import 'module-alias/register';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '@/app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { Environment, EnvironmentVariables } from '@env';
import { API_GLOBAL_PREFIX, API_SWAGGER_PATH } from '@constants/api';

const logger = new Logger('App');

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService<EnvironmentVariables, true>);

  app.enableCors();
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix(API_GLOBAL_PREFIX);

  const env = config.get('NODE_ENV', { infer: true });

  if (env !== Environment.PRODUCTION) {
    const openApiConfig = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('Test Task for Lazy Ants')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, openApiConfig, {
      deepScanRoutes: true,
    });
    SwaggerModule.setup(API_SWAGGER_PATH, app, document);
  }

  const apiPort = config.get('API_PORT', { infer: true });
  await app.listen(apiPort, () =>
    logger.log(`🚀 API is ready at http://localhost:${apiPort}`),
  );
};

bootstrap().catch((err) => logger.error(err));
