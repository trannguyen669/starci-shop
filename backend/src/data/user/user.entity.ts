import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
  })
  email!: string;

  @Column({
    select: false,//lớp bảo vệ chống vô tình trả hash ra API.
  })
  passwordHash!: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt!: Date;
}