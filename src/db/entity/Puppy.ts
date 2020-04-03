/* eslint-disable camelcase */
import {
  Entity,
  PrimaryGeneratedColumn,
  Index,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsString, MinLength, MaxLength } from 'class-validator';

@Entity('puppy')
export default class Puppy {
  @PrimaryGeneratedColumn('uuid')
  @Index()
  id!: string;

  @Column({ name: 'name', length: 64 })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name!: string;

  @CreateDateColumn({ name: 'created_at', select: false, update: false })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updated_at!: Date;
}
