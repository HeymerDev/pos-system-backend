import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity.js';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: 'default.svg',
  })
  image_url: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @ManyToOne(() => Category, (category) => category.products)
  category: Relation<Category>;
}
