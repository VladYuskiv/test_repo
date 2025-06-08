import { UUID } from "crypto";

export class UserDto {
	id: UUID;
	fullName: string;
	email: string;
}
