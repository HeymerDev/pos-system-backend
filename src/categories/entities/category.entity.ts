import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity.js';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 55, nullable: false })
  name: string;

  @OneToMany(() => Product, (product) => product.category, { cascade: true })
  products: Relation<Product[]>;
}
