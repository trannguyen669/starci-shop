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
import {
  generateRefreshToken,
  hashRefreshToken,
} from './refresh-token';

@Injectable()
export class AuthService {
  constructor(
    private readonly users:
      UserRepository,

    private readonly refreshTokens:
      RefreshTokenRepository,

    private readonly jwtService:
      JwtService,
  ) {}

  // =========================
  // Tạo access token
  // =========================

  private issueAccessToken(
    user: User,
  ) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  // =========================
  // Tạo refresh token
  // =========================

  private async issueRefreshToken(
    userId: string,
    familyId: string,
  ) {
    // Token thật gửi cho client
    const rawToken =
      generateRefreshToken();

    // DB chỉ lưu hash
    const tokenHash =
      hashRefreshToken(
        rawToken,
      );

    // Refresh token sống 7 ngày
    const expiresAt =
      new Date(
        Date.now()
        + 7
        * 24
        * 60
        * 60
        * 1000,
      );

    const token =
      this.refreshTokens.create({
        userId,
        familyId,
        tokenHash,
        expiresAt,
      });

    await this.refreshTokens.save(
      token,
    );

    // Chỉ trả token thật ra ngoài
    return rawToken;
  }

  // =========================
  // REGISTER
  // =========================

  async register(
    email: string,
    password: string,
  ) {
    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const exists =
      await this.users.existsByEmail(
        normalizedEmail,
      );

    if (exists) {
      throw new ConflictException(
        'EMAIL_TAKEN',
      );
    }

    const passwordHash =
      await hashPassword(
        password,
      );

    const user =
      await this.users.create({
        email:
          normalizedEmail,

        passwordHash,
      });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  // =========================
  // LOGIN
  // =========================

  async login(
    email: string,
    password: string,
  ) {
    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const user =
      await this.users
        .findByEmailWithPasswordHash(
          normalizedEmail,
        );

    if (!user) {
      throw new UnauthorizedException(
        'INVALID_CREDENTIALS',
      );
    }

    const passwordMatches =
      await verifyPassword(
        user.passwordHash,
        password,
      );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'INVALID_CREDENTIALS',
      );
    }

    // Access JWT
    const accessToken =
      await this.issueAccessToken(
        user,
      );

    // Mỗi lần login tạo
    // một token family mới
    const familyId =
      randomUUID();

    // Refresh token đầu tiên
    // của family này
    const refreshToken =
      await this.issueRefreshToken(
        user.id,
        familyId,
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

  // =========================
  // REFRESH
  // =========================

  async refresh(
    rawToken: string,
  ) {
    // Client gửi token thật.
    // Ta hash lại để tìm trong DB.
    const tokenHash =
      hashRefreshToken(
        rawToken,
      );

    const token =
      await this.refreshTokens
        .findByHash(
          tokenHash,
        );

    // Không tìm thấy token
    if (!token) {
      throw new UnauthorizedException(
        'INVALID_REFRESH_TOKEN',
      );
    }

    // Token đã từng được dùng
    // nhưng lại được gửi lần nữa
    // => reuse/replay attack
    if (token.revoked) {
      await this.refreshTokens
        .revokeFamily(
          token.familyId,
        );

      throw new UnauthorizedException(
        'TOKEN_REUSE_DETECTED',
      );
    }

    // Token đã hết hạn
    if (
      token.expiresAt.getTime()
      <= Date.now()
    ) {
      token.revoked = true;

      await this.refreshTokens.save(
        token,
      );

      throw new UnauthorizedException(
        'REFRESH_TOKEN_EXPIRED',
      );
    }

    // =========================
    // ROTATION
    // =========================

    // Token hiện tại đã dùng
    // => không được dùng lại
    token.revoked = true;

    await this.refreshTokens.save(
      token,
    );

    // Token DB cho biết
    // token này thuộc user nào
    const user =
      await this.users.findById(
        token.userId,
      );

    if (!user) {
      await this.refreshTokens
        .revokeFamily(
          token.familyId,
        );

      throw new UnauthorizedException(
        'INVALID_REFRESH_TOKEN',
      );
    }

    // Tạo access JWT mới
    const accessToken =
      await this.issueAccessToken(
        user,
      );

    // Tạo refresh token mới
    // NHƯNG giữ nguyên family
    const refreshToken =
      await this.issueRefreshToken(
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

  async revokeAllForUser(
    userId: string,
  ) {
    await this.refreshTokens
      .revokeAllForUser(
        userId,
      );
  }
}
