import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import {
  UserRepository,
} from '../data/user/user.repository';

import {
  hashPassword,
} from './password';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
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
}