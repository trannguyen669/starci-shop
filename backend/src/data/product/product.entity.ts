import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('int')
  priceCents!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
