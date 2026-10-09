import {
  Injectable,
} from '@nestjs/common';

import {
  PassportStrategy,
} from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import {
  loadEnv,
} from '../config/env';
import { UserRole } from 'src/data/user/user.entity';

type JwtPayload = {
  sub: string;
  email: string;
  role:UserRole;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor() {
    const env = loadEnv();

    super({
      jwtFromRequest:
        ExtractJwt
          .fromAuthHeaderAsBearerToken(),

      secretOrKey:
        env.JWT_SECRET,

      ignoreExpiration: false,
    });
  }

  validate(
    payload: JwtPayload,
  ) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}