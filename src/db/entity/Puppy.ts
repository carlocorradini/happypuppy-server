/* eslint-disable camelcase */
import {
  Entity,
  PrimaryGeneratedColumn,
  Index,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IsString, Length, IsEmpty, IsNotEmpty, IsOptional } from 'class-validator';
import User from './User';

export enum PuppyValidationGroup {
  // eslint-disable-next-line no-unused-vars
  REGISTRATION = 'registration',
  // eslint-disable-next-line no-unused-vars
  UPDATE = 'update',
}

@Entity('puppy')
export default class Puppy {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  @Index()
  @IsEmpty({ groups: [PuppyValidationGroup.REGISTRATION, PuppyValidationGroup.UPDATE] })
  id!: string;

  @Column({ name: 'name', length: 64 })
  @IsString({ groups: [PuppyValidationGroup.REGISTRATION, PuppyValidationGroup.UPDATE] })
  @IsOptional({ groups: [PuppyValidationGroup.UPDATE] })
  @IsNotEmpty({ groups: [PuppyValidationGroup.REGISTRATION, PuppyValidationGroup.UPDATE] })
  @Length(1, 64, { groups: [PuppyValidationGroup.REGISTRATION, PuppyValidationGroup.UPDATE] })
  name!: string;

  @CreateDateColumn({ name: 'created_at', select: false, update: false })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updated_at!: Date;

  @ManyToOne(() => User, (user) => user.puppies)
  @JoinColumn({ name: 'user_id' })
  user!: Promise<User>;
}
