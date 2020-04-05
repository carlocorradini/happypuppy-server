/* eslint-disable camelcase */
import {
  Entity,
  PrimaryGeneratedColumn,
  Index,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import {
  IsString,
  MaxLength,
  IsEmail,
  IsEnum,
  Length,
  IsUUID,
  IsEmpty,
  IsNotEmpty,
} from 'class-validator';
import { CryptUtil } from '@app/utils';

export enum UserRole {
  // eslint-disable-next-line no-unused-vars
  ADMIN = 'admin',
  // eslint-disable-next-line no-unused-vars
  STANDARD = 'standard',
}

export enum UserValidationGroup {
  // eslint-disable-next-line no-unused-vars
  REGISTRATION = 'registration',
  // eslint-disable-next-line no-unused-vars
  UPDATE = 'update',
}

@Entity('user')
export default class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  @Index()
  @IsEmpty({ groups: [UserValidationGroup.REGISTRATION] })
  @IsUUID('4', { groups: [UserValidationGroup.UPDATE] })
  id!: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.STANDARD,
  })
  @IsEmpty({ groups: [UserValidationGroup.REGISTRATION] })
  @IsEnum(UserRole, { groups: [UserValidationGroup.UPDATE] })
  role!: UserRole;

  @Column({ name: 'name', length: 64 })
  @IsString({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @IsNotEmpty({ groups: [UserValidationGroup.REGISTRATION] })
  @Length(1, 64, { groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  name!: string;

  @Column({ name: 'surname', length: 64 })
  @IsString({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @IsNotEmpty({ groups: [UserValidationGroup.REGISTRATION] })
  @Length(1, 64, { groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  surname!: string;

  @Column({ name: 'username', length: 128, unique: true, update: false })
  @IsString({ groups: [UserValidationGroup.REGISTRATION] })
  @IsNotEmpty({ groups: [UserValidationGroup.REGISTRATION] })
  @IsEmpty({ groups: [UserValidationGroup.UPDATE] })
  @Length(1, 128, { groups: [UserValidationGroup.REGISTRATION] })
  username!: string;

  @Column({ name: 'email', length: 128, unique: true, select: false, update: false })
  @IsEmail(undefined, { groups: [UserValidationGroup.REGISTRATION] })
  @IsNotEmpty({ groups: [UserValidationGroup.REGISTRATION] })
  @IsEmpty({ groups: [UserValidationGroup.UPDATE] })
  @MaxLength(128, { groups: [UserValidationGroup.REGISTRATION] })
  email!: string;

  @Column({ name: 'password', length: 72, select: false })
  @IsString({ groups: [UserValidationGroup.REGISTRATION] })
  @IsNotEmpty({ groups: [UserValidationGroup.REGISTRATION] })
  @IsEmpty({ groups: [UserValidationGroup.UPDATE] })
  @Length(8, 64, { groups: [UserValidationGroup.REGISTRATION] }) // Clear password
  password!: string;

  @CreateDateColumn({ name: 'created_at', select: false, update: false })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updated_at!: Date;

  @BeforeInsert()
  async onRegistration() {
    this.role = UserRole.STANDARD;
    this.password = await CryptUtil.hash(this.password);
  }
}
