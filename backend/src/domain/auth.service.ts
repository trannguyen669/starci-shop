import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { RefreshTokenRepository } from '../data/refresh-token/refresh-token.repository';
import { User } from '../data/user/user.entity';
import { UserRepository } from '../data/user/user.repository';
import { hashPassword, verifyPassword } from './password';
import { generateRefreshToken, hashRefreshToken } from './refresh-token';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  private issueAccessToken(user: User) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private async issueRefreshToken(userId: string, familyId: string) {
    // Chỉ trả token thô cho client; database lưu hash.
    const rawToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const token = this.refreshTokens.create({
      userId,
      familyId,
      tokenHash,
      expiresAt,
    });

    await this.refreshTokens.save(token);

    return rawToken;
  }

  async register(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const exists = await this.users.existsByEmail(normalizedEmail);

    if (exists) {
      throw new ConflictException('EMAIL_TAKEN');
    }

    const passwordHash = await hashPassword(password);
    const user = await this.users.create({
      email: normalizedEmail,
      passwordHash,
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.users.findByEmailWithPasswordHash(
      normalizedEmail,
    );

    if (!user) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const passwordMatches = await verifyPassword(
      user.passwordHash,
      password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const accessToken = await this.issueAccessToken(user);
    const familyId = randomUUID();
    const refreshToken = await this.issueRefreshToken(user.id, familyId);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(rawToken: string) {
    const tokenHash = hashRefreshToken(rawToken);
    const token = await this.refreshTokens.findByHash(tokenHash);

    if (!token) {
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }

    // Token đã bị thu hồi nhưng được gửi lại: thu hồi cả family.
    if (token.revoked) {
      await this.refreshTokens.revokeFamily(token.familyId);
      throw new UnauthorizedException('TOKEN_REUSE_DETECTED');
    }

    if (token.expiresAt.getTime() <= Date.now()) {
      token.revoked = true;
      await this.refreshTokens.save(token);
      throw new UnauthorizedException('REFRESH_TOKEN_EXPIRED');
    }

    // Rotation: token cũ chỉ được dùng một lần.
    token.revoked = true;
    await this.refreshTokens.save(token);

    const user = await this.users.findById(token.userId);

    if (!user) {
      await this.refreshTokens.revokeFamily(token.familyId);
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }

    const accessToken = await this.issueAccessToken(user);
    const refreshToken = await this.issueRefreshToken(
      user.id,
      token.familyId,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async revokeAllForUser(userId: string) {
    await this.refreshTokens.revokeAllForUser(userId);
  }

  async getProfile(userId: string) {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new UnauthorizedException('USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
    };
  }
}
