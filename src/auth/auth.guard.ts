import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariables } from "@env";
import { UsersService } from "@/users/users.service";
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService<EnvironmentVariables, true>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token)
      throw new UnauthorizedException('Not authenticated.');

    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get('JWT_SECRET', { infer: true }),
      });
    } catch {
      throw new UnauthorizedException('Incorrect token.');
    }

    if (!payload || !payload.userId)
      throw new UnauthorizedException('Incorrect payload.');

    const user = await this.usersService.findById(payload.userId);

    if (!user)
      throw new UnauthorizedException('User was not found.');

    request['user'] = user;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
