import { TableName } from '@enums/TableName';
import { QueryInterface, DataTypes } from 'sequelize';

const emailIndexName = `${TableName.USERS}_email_deletedAt_index`;

export default {
  up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) =>
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        TableName.USERS,
        {
          id: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue:
              queryInterface.sequelize.literal('uuid_generate_v4()'),
          },
          email: {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          password: {
            type: Sequelize.STRING(500),
            allowNull: false,
          },
          fullName: {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          createdAt: {
            type: 'TIMESTAMP',
            allowNull: false,
            defaultValue: queryInterface.sequelize.literal('NOW()'),
          },
          updatedAt: {
            type: 'TIMESTAMP',
            allowNull: false,
            defaultValue: queryInterface.sequelize.literal('NOW()'),
          },
          deletedAt: 'TIMESTAMP',
        },
        { transaction },
      );

      await queryInterface.addIndex(TableName.USERS, ['email', 'deletedAt'], {
        name: emailIndexName,
        unique: true,
        transaction,
      });
    }),
  down: async (queryInterface: QueryInterface) =>
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex(TableName.USERS, emailIndexName, {
        transaction,
      });
      await queryInterface.dropTable(TableName.USERS, { transaction });
    }),
};
