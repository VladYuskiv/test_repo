// NOTE this is for sequelize-cli

import 'module-alias/register';
import { Environment } from '@env';
import { Dialect } from 'sequelize';

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PORT,
} = process.env;

const configForRemoteServer = {
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  host: POSTGRES_HOST,
  port: parseInt(POSTGRES_PORT),
  dialect: 'postgres' as Dialect,
};

const sequelizeConfigs = {
  [Environment.DEVELOPMENT]: configForRemoteServer,
  [Environment.PRODUCTION]: configForRemoteServer,
  [Environment.LOCAL]: configForRemoteServer,
};

module.exports = sequelizeConfigs;
