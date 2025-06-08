import { plainToClass } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, Max, Min, validateSync } from 'class-validator';

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  LOCAL = 'local',
  TEST = 'test'
}

export class EnvironmentVariables {
  // API
  @IsNumber()
  @Min(0)
  @Max(65535)
  API_PORT: number;
  
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.LOCAL;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN: string = '1 min';

  @IsNumber()
  @IsPositive()
  PASSWORD_SALT: number = 10;

  // Postgres
  @IsString()
  @IsNotEmpty()
  POSTGRES_HOST: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  POSTGRES_PORT: number;
  
  @IsString()
  @IsNotEmpty()
  POSTGRES_USER: string;
  
  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD: string;
  
  @IsString()
  @IsNotEmpty()
  POSTGRES_DB: string;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0)
    throw new Error(errors.toString());

  return validatedConfig;
};
