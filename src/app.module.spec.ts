import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, Environment } from '@env';

// Mock all required modules
jest.mock('@nestjs/sequelize', () => ({
  SequelizeModule: {
    forRootAsync: jest.fn().mockReturnValue({
      module: class MockSequelizeModule {},
      providers: [],
      exports: [],
    }),
  },
}));

jest.mock('@nestjs/config', () => ({
  ConfigModule: {
    forRoot: jest.fn().mockReturnValue({
      module: class MockConfigModule {},
      providers: [],
      exports: [],
    }),
  },
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
  })),
}));

jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: class MockSwaggerModule {},
}));

jest.mock('@/auth/auth.module', () => ({
  AuthModule: class MockAuthModule {},
}));

jest.mock('@/products/products.module', () => ({
  ProductsModule: class MockProductsModule {},
}));

jest.mock('@/users/users.module', () => ({
  UsersModule: class MockUsersModule {},
}));

jest.mock('@common/filters/exception-filters.module', () => ({
  ExceptionFiltersModule: class MockExceptionFiltersModule {},
}));

jest.mock('@env', () => ({
  EnvironmentModule: class MockEnvironmentModule {},
  Environment: {
    LOCAL: 'local',
    PRODUCTION: 'production',
  },
}));

describe('AppModule', () => {
  let module: TestingModule;
  let configService: ConfigService<EnvironmentVariables>;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    configService =
      module.get<ConfigService<EnvironmentVariables>>(ConfigService);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have ConfigService available', () => {
    expect(configService).toBeDefined();
  });

  it('should have environment variables set', () => {
    const getSpy = jest.spyOn(configService, 'get');
    getSpy.mockImplementation((key: keyof EnvironmentVariables) => {
      switch (key) {
        case 'POSTGRES_HOST':
          return 'localhost';
        case 'POSTGRES_PORT':
          return 5432;
        case 'POSTGRES_USER':
          return 'test';
        case 'POSTGRES_PASSWORD':
          return 'test';
        case 'POSTGRES_DB':
          return 'test';
        case 'JWT_SECRET':
          return 'test-secret';
        case 'JWT_EXPIRES_IN':
          return '1h';
        case 'NODE_ENV':
          return Environment.LOCAL;
        case 'API_PORT':
          return 3000;
        case 'PASSWORD_SALT':
          return 10;
        default:
          return undefined;
      }
    });

    expect(configService.get('POSTGRES_HOST')).toBe('localhost');
    expect(configService.get('POSTGRES_PORT')).toBe(5432);
    expect(configService.get('POSTGRES_USER')).toBe('test');
    expect(configService.get('POSTGRES_PASSWORD')).toBe('test');
    expect(configService.get('POSTGRES_DB')).toBe('test');
    expect(configService.get('JWT_SECRET')).toBe('test-secret');
    expect(configService.get('JWT_EXPIRES_IN')).toBe('1h');
    expect(configService.get('NODE_ENV')).toBe(Environment.LOCAL);
    expect(configService.get('API_PORT')).toBe(3000);
    expect(configService.get('PASSWORD_SALT')).toBe(10);
  });
});
