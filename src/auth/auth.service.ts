import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from '@/auth/dto/sign-up.dto';
import { UsersService } from '@/users/users.service';
import { TokenDto } from '@/auth/dto/token.dto';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from '@/auth/dto/sign-in.dto';
import User from '@/users/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async signUp(data: SignUpDto): Promise<TokenDto> {
    const user = await this.usersService.create(data);
    return await this.generateToken(user);
  }

  public async signIn(data: SignInDto): Promise<TokenDto> {
    const user = await this.usersService.findByEmail(data.email);

    if (!user) throw new UnauthorizedException(`Incorrect email or password.`);

    if (!(await this.usersService.comparePassword(user, data.password)))
      throw new UnauthorizedException(`Incorrect email or password.`);

    return await this.generateToken(user);
  }

  private async generateToken(user: User): Promise<TokenDto> {
    const accessToken = await this.jwtService.signAsync({ userId: user.id });
    return { accessToken };
  }
}
