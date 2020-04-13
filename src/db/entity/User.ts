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
  OneToMany,
} from 'typeorm';
import {
  IsString,
  IsEmail,
  IsEnum,
  Length,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsMobilePhone,
} from 'class-validator';
import { CryptUtil } from '@app/util';
import Puppy from './Puppy';

export enum UserValidationGroup {
  // eslint-disable-next-line no-unused-vars
  REGISTRATION = 'registration',
  // eslint-disable-next-line no-unused-vars
  SIGN_IN = 'sign_in',
  // eslint-disable-next-line no-unused-vars
  UPDATE = 'update',
}

export enum UserGender {
  // eslint-disable-next-line no-unused-vars
  MALE = 'male',
  // eslint-disable-next-line no-unused-vars
  FEMALE = 'female',
  // eslint-disable-next-line no-unused-vars
  UNKNOWN = 'unknown',
}

export enum UserRole {
  // eslint-disable-next-line no-unused-vars
  ADMIN = 'admin',
  // eslint-disable-next-line no-unused-vars
  STANDARD = 'standard',
}

@Entity('user')
export default class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  @Index()
  @IsEmpty({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  id!: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.STANDARD,
  })
  @IsEnum(UserRole, { groups: [UserValidationGroup.UPDATE] })
  @IsOptional({ groups: [UserValidationGroup.UPDATE] })
  @IsEmpty({ groups: [UserValidationGroup.REGISTRATION] })
  @IsNotEmpty({ groups: [UserValidationGroup.UPDATE] })
  role!: UserRole;

  @Column({ name: 'verified', default: false, select: false })
  @IsEmpty({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  verified!: boolean;

  @Column({ name: 'name', length: 64 })
  @IsString({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @IsOptional({ groups: [UserValidationGroup.UPDATE] })
  @IsNotEmpty({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @Length(1, 64, { groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  name!: string;

  @Column({ name: 'surname', length: 64 })
  @IsString({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @IsOptional({ groups: [UserValidationGroup.UPDATE] })
  @IsNotEmpty({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @Length(1, 64, { groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  surname!: string;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: UserGender,
    default: UserGender.UNKNOWN,
    update: false,
  })
  @IsEnum(UserGender, { groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @IsOptional({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @IsNotEmpty({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  gender!: UserGender;

  @Column({ name: 'username', length: 128, unique: true, update: false })
  @IsString({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.SIGN_IN] })
  @IsNotEmpty({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.SIGN_IN] })
  @IsEmpty({ groups: [UserValidationGroup.UPDATE] })
  @Length(1, 128, { groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.SIGN_IN] })
  username!: string;

  @Column({ name: 'email', length: 128, unique: true, select: false, update: false })
  @IsEmail(undefined, { groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @IsOptional({ groups: [UserValidationGroup.UPDATE] })
  @IsNotEmpty({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @Length(3, 128, { groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  email!: string;

  @Column({ name: 'phone', length: 15, unique: true, select: false, update: false })
  @IsMobilePhone('any', { groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @IsOptional({ groups: [UserValidationGroup.UPDATE] })
  @IsNotEmpty({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @Length(8, 15, { groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  phone!: string;

  @Column({ name: 'password', length: 72, select: false })
  @IsString({
    groups: [
      UserValidationGroup.REGISTRATION,
      UserValidationGroup.SIGN_IN,
      UserValidationGroup.UPDATE,
    ],
  })
  @IsOptional({ groups: [UserValidationGroup.UPDATE] })
  @IsNotEmpty({
    groups: [
      UserValidationGroup.REGISTRATION,
      UserValidationGroup.SIGN_IN,
      UserValidationGroup.UPDATE,
    ],
  })
  @Length(8, 64, {
    groups: [
      UserValidationGroup.REGISTRATION,
      UserValidationGroup.SIGN_IN,
      UserValidationGroup.UPDATE,
    ],
  })
  password!: string;

  @Column({ name: 'avatar', length: 256 })
  @IsEmpty({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  avatar!: string;

  @OneToMany(() => Puppy, (puppy) => puppy.user)
  puppies!: Puppy[];

  @CreateDateColumn({ name: 'created_at', select: false, update: false })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updated_at!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password !== undefined) this.password = await CryptUtil.hash(this.password);
  }

  @BeforeInsert()
  defaultAvatar() {
    switch (this.gender) {
      case UserGender.MALE: {
        this.avatar =
          'https://res.cloudinary.com/dxiqa0xwa/image/upload/v1586709310/happypuppy/upload/user/avatar/male.png';
        break;
      }
      case UserGender.FEMALE: {
        this.avatar =
          'https://res.cloudinary.com/dxiqa0xwa/image/upload/v1586709310/happypuppy/upload/user/avatar/female.png';
        break;
      }
      default: {
        this.avatar =
          'https://res.cloudinary.com/dxiqa0xwa/image/upload/v1586709310/happypuppy/upload/user/avatar/unknown.png';
        break;
      }
    }
  }
}
