import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { ConfigService } from '@nestjs/config';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UnauthorizedException } from '@nestjs/common';
import User from '@/users/models/user.model';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser: Partial<User> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    fullName: 'Test User',
    password: 'hashedPassword',
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    comparePassword: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user and return a token', async () => {
      const signUpDto: SignUpDto = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };

      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('test-token');

      const result = await service.signUp(signUpDto);

      expect(result).toEqual({ accessToken: 'test-token' });
      expect(mockUsersService.create).toHaveBeenCalledWith(signUpDto);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
    });
  });

  describe('signIn', () => {
    it('should return a token for valid credentials', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.comparePassword.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('test-token');

      const result = await service.signIn(signInDto);

      expect(result).toEqual({ accessToken: 'test-token' });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        signInDto.email,
      );
      expect(mockUsersService.comparePassword).toHaveBeenCalledWith(
        mockUser,
        signInDto.password,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.comparePassword.mockResolvedValue(false);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const signInDto: SignInDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
