import {
  Injectable, UnauthorizedException, ConflictException,
  Inject, Logger, OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  // ✅ Lifecycle Hook
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2, // ✅ Event Emitter
  ) {}

  onModuleInit() {
    this.logger.log('AuthService initialized');
  }

  async register(dto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.usersService.create(dto);

    // ✅ Event Emitter
    this.eventEmitter.emit('user.registered', {
      userId: user.id,
      email: user.email,
    });

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // ✅ Event
    this.eventEmitter.emit('user.logged_in', { userId: user.id });

    return { user, ...tokens };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access denied');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.update(userId, { refreshTokenHash: null });
  }

  async validateOAuthLogin(profile: any, provider: string) {
    let user = await this.usersService.findByOAuthId(provider, profile.id);

    if (!user) {
      user = await this.usersService.createFromOAuth({
        email: profile.emails[0].value,
        firstName: profile.name?.givenName || profile.displayName,
        lastName: profile.name?.familyName || '',
        [`${provider}Id`]: profile.id,
        avatar: profile.photos?.[0]?.value,
        isEmailVerified: true,
      });

      this.eventEmitter.emit('user.registered', {
        userId: user.id,
        email: user.email,
        provider,
      });
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: any) {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, { refreshTokenHash: hash });
  }
}