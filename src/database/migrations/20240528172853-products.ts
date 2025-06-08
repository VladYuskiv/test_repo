import { TableName } from "@enums/TableName";
import { QueryInterface, DataTypes } from "sequelize";

const nameIndexName = `${TableName.PRODUCTS}_name_index`;

export default {
	up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) =>
		await queryInterface.sequelize.transaction(async transaction => {

			await queryInterface.createTable(TableName.PRODUCTS, {
				id: {
					type: Sequelize.UUID,
					allowNull: false,
					primaryKey: true,
					defaultValue: queryInterface.sequelize.literal('uuid_generate_v4()')
				},
				name: {
					type: Sequelize.STRING(100),
					allowNull: false
				},
				description: Sequelize.TEXT,
				price: {
					type: Sequelize.DECIMAL(10, 2).UNSIGNED,
					allowNull: false,
					defaultValue: 0
				},
				category: {
					type: Sequelize.STRING(100),
					allowNull: false
				},
				createdAt: {
					type: 'TIMESTAMP',
					allowNull: false,
					defaultValue: queryInterface.sequelize.literal('NOW()')
				},
				updatedAt: {
					type: 'TIMESTAMP',
					allowNull: false,
					defaultValue: queryInterface.sequelize.literal('NOW()')
				},
				deletedAt: 'TIMESTAMP'
			}, { transaction });

			await queryInterface.addIndex(TableName.PRODUCTS, ['name'], {
				name: nameIndexName,
				unique: true,
				where: { deletedAt: null },
				transaction
			});

		}),
	down: async (queryInterface: QueryInterface) =>
		await queryInterface.sequelize.transaction(async transaction => {
			await queryInterface.removeIndex(TableName.PRODUCTS, nameIndexName, { transaction });
			await queryInterface.dropTable(TableName.PRODUCTS, { transaction });
		})
};