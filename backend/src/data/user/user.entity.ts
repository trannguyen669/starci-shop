import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type UserRole =
  | 'user'
  | 'admin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
  })
  email!: string;

  @Column({
    select: false,// lớp bảo vệ chống vô tình trả ra hash mật khẩu khi truy vấn
  })
  passwordHash!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'user',
  })
  role!: UserRole;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt!: Date;
}