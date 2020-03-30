/* eslint-disable camelcase */
import {
  Entity,
  PrimaryGeneratedColumn,
  Index,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsString, MinLength, MaxLength, IsEmail } from 'class-validator';
import { CryptUtil } from '../../utils';

@Entity('user')
export default class User {
  @PrimaryGeneratedColumn('uuid')
  @Index()
  id!: string;

  @Column({ name: 'name', length: 64 })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name!: string;

  @Column({ name: 'surname', length: 64 })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  surname!: string;

  @Column({ name: 'username', length: 128, unique: true, update: false })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  username!: string;

  @Column({ name: 'email', length: 128, unique: true, update: false })
  @IsEmail()
  @MaxLength(128)
  email!: string;

  @Column({ name: 'password', length: 72, select: false })
  @IsString()
  @MinLength(8) // Real password min length
  @MaxLength(128) // Real password max length
  password!: string;

  @CreateDateColumn({ name: 'create_date', select: false, update: false })
  create_date!: Date;

  @UpdateDateColumn({ name: 'update_date', select: false })
  update_date!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await CryptUtil.hash(this.password);
  }
}
