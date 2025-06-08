import { Model } from "sequelize-typescript";
import { FindAndCountOptions } from "sequelize";
import { PaginatedResponseDto } from "@common/dto/paginated-response.dto";

export class BaseModel<TAttributes extends {}, TCreationAttributes extends {}> extends Model<TAttributes, TCreationAttributes> {
	public static async paginate<TModel extends BaseModel<any, any>>(options: Omit<FindAndCountOptions<{}>, "group"> | undefined = {}): Promise<PaginatedResponseDto<TModel>> {
		const limit: number = options?.limit || 10;
		const offset: number = options?.offset || 0;

		const { rows, count } = await this.findAndCountAll({ distinct: true, ...options });

		return {
			records: rows as TModel[],
			pagination: {
				total: count,
				totalPages: Math.ceil(count / limit),
				currentPage: Math.floor(offset / limit) + 1,
				nextPageExists: count > offset + limit,
				previousPageExists: offset > 0
			}
		};
	}

	public static async exists(where: any, options: any = {}) {
		if (where.id && typeof where.id === 'string' && Object.keys(where).length === 1)
			return Boolean(await this.findByPk(where.id));

		return Boolean(await this.findOne({ where, ...options }));
	}
}