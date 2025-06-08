import { TableName } from "@enums/TableName";
import { QueryInterface } from "sequelize";
import * as bcrypt from 'bcrypt';
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariables } from "@env";

const config = new ConfigService<EnvironmentVariables, true>();

export const defaultUser = {
	email: 'user2024@user.com',
	fullName: 'User Userenko',
	password: 'user2024@user.com'
};

export default {
	up: async (queryInterface: QueryInterface) => {
		let user = defaultUser;

		user.password = await bcrypt.hash(user.password, parseInt(config.get('PASSWORD_SALT', { infer: true })));

		await queryInterface.insert(null, TableName.USERS, defaultUser);
	},
	down: async (queryInterface: QueryInterface) =>
		await queryInterface.bulkDelete(TableName.USERS, { email: defaultUser.email })
};
