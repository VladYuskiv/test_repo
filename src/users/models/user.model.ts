import { BaseModel } from '@core/BaseModel';
import { ModelName } from '@enums/ModelName';
import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { TableName } from '@enums/TableName';
import { UUID } from 'crypto';

export interface UserAttributes {
  id: UUID;
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface UserCreationAttributes {
  fullName: string;
  email: string;
  password: string;
}

@Table({
  modelName: ModelName.USER,
  tableName: TableName.USERS,
  paranoid: true,
  timestamps: true,
})
export default class User extends BaseModel<
  UserAttributes,
  UserCreationAttributes
> {
  @Column(DataType.STRING)
  declare fullName: string;

  @Column(DataType.STRING)
  declare email: string;

  @Column(DataType.STRING)
  declare password: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt?: Date;
}
