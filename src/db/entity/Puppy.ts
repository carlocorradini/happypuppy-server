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
  RelationId,
  BeforeInsert,
} from 'typeorm';
import { IsString, Length, IsEmpty, IsNotEmpty, IsOptional } from 'class-validator';
import config from '@app/config';
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

  @Column({ name: 'avatar', length: 128 })
  @IsString({ groups: [PuppyValidationGroup.UPDATE] })
  @IsOptional({ groups: [PuppyValidationGroup.UPDATE] })
  @IsEmpty({ groups: [PuppyValidationGroup.REGISTRATION] })
  @IsNotEmpty({ groups: [PuppyValidationGroup.UPDATE] })
  @Length(1, 128, { groups: [PuppyValidationGroup.UPDATE] })
  avatar!: string;

  @ManyToOne(() => User, (user) => user.puppies, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @RelationId((puppy: Puppy) => puppy.user)
  @IsEmpty({ always: true })
  user_id!: string;

  @CreateDateColumn({ name: 'created_at', select: false, update: false })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updated_at!: Date;

  @BeforeInsert()
  defaultAvatar() {
    this.avatar =
      config.RESOURCE.IMAGE.PUPPY.CONTEXT_PATH +
      new Date().toISOString() +
      config.RESOURCE.IMAGE.PUPPY.EXT;
  }
}
