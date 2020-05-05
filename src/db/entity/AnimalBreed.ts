/* eslint-disable camelcase */
import {
  Entity,
  Index,
  Column,
  PrimaryColumn,
  Check,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmpty } from 'class-validator';
import AnimalSpecie from './AnimalSpecie';

@Entity('animal_breed')
@Check(`"id" > 0`)
export default class AnimalBreed {
  @PrimaryColumn({ name: 'id' })
  @Index()
  id!: number;

  @Column({ name: 'name', length: 64, unique: true })
  name!: string;

  @ManyToOne(() => AnimalSpecie, (specie) => specie.breeds, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'specie_id' })
  specie!: AnimalSpecie;

  @CreateDateColumn({ name: 'created_at', select: false, update: false })
  @IsEmpty({ always: true })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  @IsEmpty({ always: true })
  updated_at!: Date;
}
