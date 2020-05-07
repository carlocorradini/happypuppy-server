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

export enum AnimalPlaceType {
  // eslint-disable-next-line no-unused-vars
  PARK = 'park',
  // eslint-disable-next-line no-unused-vars
  SHOP = 'shop',
  // eslint-disable-next-line no-unused-vars
  VETERINARY = 'veterinary',
  // eslint-disable-next-line no-unused-vars
  GROOMING = 'grooming',
}

@Entity('animal_place')
@Check(`"id" > 0`)
export default class AnimalPlace {
  @PrimaryColumn({ name: 'id' })
  @Index()
  id!: number;

  @Column({ name: 'latitude', type: 'float8' })
  @Index()
  latitude!: number;

  @Column({ name: 'longitude', type: 'float8' })
  @Index()
  longitude!: number;

  @Column({ name: 'name' })
  name!: string;

  @Column({ name: 'type', type: 'enum', enum: AnimalPlaceType })
  @Index()
  type!: AnimalPlaceType;

  @CreateDateColumn({ name: 'created_at', select: false, update: false })
  @IsEmpty({ always: true })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  @IsEmpty({ always: true })
  updated_at!: Date;
}
