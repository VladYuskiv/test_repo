import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import User from "@/users/models/user.model";
import { CreateUserDto } from "@/users/dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariables } from "@env";
import { pick } from "@core/utils/pick";

@Injectable()
export class UsersService {
  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) {}

  public async findById(id: UUID, attributes?: (keyof User)[]): Promise<User | null> {
    return await User.findByPk(id, { attributes });
  }

  public async findByEmail(email: string, attributes?: (keyof User)[]): Promise<User | null> {
    return await User.findOne({ where: { email }, attributes });
  }

  public async create(data: CreateUserDto, attributes?: (keyof User)[]): Promise<User> {
    const { email } = data;

    if (await User.exists({ email }))
      throw new BadRequestException(`User with the email "${email}" already exists.`);

    data.password = await this.hashPassword(data.password);
    const user = await User.create(data);
    return pick(user, attributes);
  }

  public async comparePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = this.config.get('PASSWORD_SALT', { infer: true });
    return await bcrypt.hash(password, saltRounds);
  }
}
