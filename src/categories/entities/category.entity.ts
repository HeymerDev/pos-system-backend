import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity.js';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  // Unique only among active categories, so a deleted name can be reused
  @Index({ unique: true, where: '"deletedAt" IS NULL' })
  @Column({ type: 'varchar', length: 55, nullable: false })
  name: string;

  @OneToMany(() => Product, (product) => product.category, { cascade: true })
  products: Relation<Product[]>;

  @DeleteDateColumn({ select: false })
  deletedAt?: Date;
}
