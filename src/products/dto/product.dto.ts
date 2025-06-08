import { UUID } from "crypto";

export class ProductDto {
	id: UUID;
	name: string;
	description: string;
	price: string;
	category: string;
}