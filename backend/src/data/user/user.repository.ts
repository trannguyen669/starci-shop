import {
  Injectable,
} from '@nestjs/common';
import {
  DataSource,
} from 'typeorm';

import {
  User,
} from './user.entity';

type CreateUserData = {
  email: string;
  passwordHash: string;
};

@Injectable()
export class UserRepository {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  async existsByEmail(
    email: string,
  ): Promise<boolean> {
    const repository =
      this.dataSource.getRepository(User);

    return repository.existsBy({
      email,
    });
  }

  async create(
    data: CreateUserData,
  ): Promise<User> {
    const repository =
      this.dataSource.getRepository(User);

    const user =
      repository.create(data);

    return repository.save(user);
  }
}