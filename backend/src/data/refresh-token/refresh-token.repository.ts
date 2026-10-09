import {
  Injectable,
} from '@nestjs/common';

import {
  DataSource,
} from 'typeorm';

import {
  RefreshToken,
} from './refresh-token.entity';

type CreateRefreshTokenData = {
  familyId: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

@Injectable()
export class RefreshTokenRepository {
  constructor(
    private readonly dataSource:
      DataSource,
  ) {}

  private get repository() {
    return this.dataSource
      .getRepository(RefreshToken);
  }

  findByHash(
    tokenHash: string,
  ) {
    return this.repository.findOneBy({
      tokenHash,
    });
  }

  create(
    data: CreateRefreshTokenData,
  ) {
    return this.repository.create(data);
  }

  save(
    token: RefreshToken,
  ) {
    return this.repository.save(token);
  }

  async revokeFamily(
    familyId: string,
  ) {
    await this.repository.update(
      {
        familyId,
      },
      {
        revoked: true,
      },
    );
  }

  async revokeAllForUser(
    userId: string,
  ) {
    await this.repository.update(
      {
        userId,
      },
      {
        revoked: true,
      },
    );
  }
}