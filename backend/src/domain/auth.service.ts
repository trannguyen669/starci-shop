import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {UserRepository} from '../data/user/user.repository';

import { hashPassword, verifyPassword } from './password';

import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
  ) {
    const normalizedEmail =
      email.trim().toLowerCase();

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
      await hashPassword(password);

    const user =
      await this.users.create({
        email: normalizedEmail,
        passwordHash,
      });

    return {
      id: user.id,
      email: user.email,
    };
  }

  async login(
    email: string,
    password: string,
  ) {
    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      await this.users.findByEmailWithPasswordHash(
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

    const accessToken =
      await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      });

    return {
      accessToken,
    };
  }
}
