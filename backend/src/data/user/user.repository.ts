import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

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

  async findByEmailWithPasswordHash(
    email: string,
  ): Promise<User | null> {
    const repository =
      this.dataSource.getRepository(User);

    return repository
      .createQueryBuilder('user')// tạo 1 truy vấn bằng query builder
      .addSelect('user.passwordHash')// thêm cột passwordHash vào truy vấn, vì nó đã được đánh dấu là select: false trong entity
      .where(
        'user.email = :email',
        { email },
      )
      .getOne();// thực thi truy vấn và lấy kết quả đầu tiên
  }

  findById(
    id: string,
  ) {
    return this.dataSource
      .getRepository(User)
      .findOneBy({
        id,
      });
  }
}
