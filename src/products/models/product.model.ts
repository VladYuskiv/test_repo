import { BaseModel } from "@core/BaseModel";
import { ModelName } from "@enums/ModelName";
import { Column, CreatedAt, DataType, DeletedAt, Table, UpdatedAt } from "sequelize-typescript";
import { TableName } from "@enums/TableName";
import { UUID } from "crypto";
import { Exclude } from "class-transformer";

// NOTE: Category should be as a separate model, but for the sake of simplicity, I will keep it here.
// NOTE: Price field is a string, but in database it is stored as decimal. Work with the price as a string should be done using libraries like decimal.js or big.js.

export interface ProductAttributes {
	id: UUID;
	name: string;
	description: string;
	price: string;
	category: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

export interface ProductCreationAttributes {
	name: string;
	description: string;
	price: string;
	category: string;
}

@Table({
	modelName: ModelName.PRODUCT,
	tableName: TableName.PRODUCTS,
	paranoid: true,
	timestamps: true
})
export default class Product extends BaseModel<ProductAttributes, ProductCreationAttributes> {
	@Column(DataType.STRING)
	declare name: string;

	@Column(DataType.STRING)
	declare description: string;

	@Column(DataType.DECIMAL(10, 2).UNSIGNED)
	declare price: string;

	@Column(DataType.STRING)
	declare category: string;

	@CreatedAt
	declare createdAt: Date;

	@UpdatedAt
	declare updatedAt: Date;

	@DeletedAt
	declare deletedAt?: Date;
}
