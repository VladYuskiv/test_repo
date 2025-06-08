import { IsDecimal, IsOptional, IsString, MaxLength } from "class-validator";
import { IsNotBlank } from "@/common/validators/is-not-blank";
import { Trim } from "@common/transformers/trim.transformer";

export class CreateProductDto {
	@IsString()
	@IsNotBlank()
	@Trim()
	@MaxLength(100)
	name: string;

	@IsOptional()
	@IsString()
	@IsNotBlank()
	@Trim()
	description?: string;

	@IsDecimal()
	price: string;

	@IsString()
	@IsNotBlank()
	@Trim()
	@MaxLength(100)
	category: string;
}
