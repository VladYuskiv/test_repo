import { IsEmail, IsString, MaxLength } from "class-validator";
import { IsNotBlank } from "@/common/validators/is-not-blank";
import { IsStrongPassword } from "@common/validators/is-strong-password";
import { Trim } from "@common/transformers/trim.transformer";

export class SignUpDto {
	@IsString()
	@IsNotBlank()
	@Trim()
	@MaxLength(100)
	fullName: string;

	@IsEmail()
	@Trim()
	email: string;

	@IsString()
	@IsStrongPassword()
	password: string;
}
