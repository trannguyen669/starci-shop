import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('refresh_tokens')
@Index(
  'idx_refresh_tokens_family_id',
  ['familyId'],
)
@Index(
  'uq_refresh_tokens_token_hash',
  ['tokenHash'],
  {
    unique: true,//đảm bảo mỗi hash chỉ xuất hiện một lần
  },
)
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  familyId!: string;

  @Column('uuid')
  userId!: string;

  @Column({
    type: 'char',
    length: 64,
  })
  tokenHash!: string;

  @Column({
    default: false,
  })
  revoked!: boolean;

  @Column({
    type: 'timestamptz',
  })
  expiresAt!: Date;
}