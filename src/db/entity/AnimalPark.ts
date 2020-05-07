/* eslint-disable camelcase */
import {
  Entity,
  PrimaryColumn,
  Index,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';
import { IsEmpty } from 'class-validator';

@Entity('animal_park')
@Check(`"id" > 0`)
export default class AnimalPark {
  @PrimaryColumn({ name: 'id' })
  @Index()
  id!: number;

  @Column({ name: 'latitude', type: 'float8' })
  latitude!: number;

  @Column({ name: 'longitude', type: 'float8' })
  longitude!: number;

  @Column({ name: 'name' })
  name!: string;

  @CreateDateColumn({ name: 'created_at', select: false, update: false })
  @IsEmpty({ always: true })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  @IsEmpty({ always: true })
  updated_at!: Date;
}
