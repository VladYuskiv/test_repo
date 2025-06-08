import { IsEmail, IsString } from "class-validator";
import { IsNotBlank } from "@/common/validators/is-not-blank";
import { Trim } from "@common/transformers/trim.transformer";

export class SignInDto {
	@IsEmail()
	@Trim()
	email: string;

	@IsString()
	@IsNotBlank()
	@Trim()
	password: string;
}
