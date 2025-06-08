import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from '@/auth/auth.service';
import { SignUpDto } from '@/auth/dto/sign-up.dto';
import { TokenDto } from '@/auth/dto/token.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { SignInDto } from '@/auth/dto/sign-in.dto';
import { UserDto } from '@/users/dto/user.dto';
import User from '@/users/models/user.model';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Signs up a new user.
   * If a user with the same email already exists, a 400 Bad Request response is returned.
   */
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiBadRequestResponse({
    description: `User with the same email already exists`,
  })
  public async signUp(@Body() signUpDto: SignUpDto): Promise<TokenDto> {
    return await this.authService.signUp(signUpDto);
  }

  /**
   * Sign in an existing user.
   * If the user doesn't exist, a 401 Unauthorized response is returned.
   */
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: `Incorrect email or password` })
  public async signIn(@Body() signInDto: SignInDto): Promise<TokenDto> {
    return await this.authService.signIn(signInDto);
  }

  /**
   * Retrieves the current user.
   */
  @UseGuards(AuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  public async findOne(@Req() req: any): Promise<UserDto> {
    const user = req.user as User;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };
  }
}
