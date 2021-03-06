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
  IsOptional,
  IsMobilePhone,
  IsISO8601,
  isEmpty,
} from 'class-validator';
import { CryptUtil } from '@app/util';
import { HasNoWhitespace } from '@app/common/validator';
import Puppy from './Puppy';
import UserFriend from './UserFriend';

export enum UserValidationGroup {
  // eslint-disable-next-line no-unused-vars
  CREATION = 'creation',
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
  @IsEmpty({ always: true })
  id!: string;

  @Column({ name: 'username', length: 128, unique: true, update: false })
  @IsString({ groups: [UserValidationGroup.CREATION, UserValidationGroup.SIGN_IN] })
  @Length(1, 128, { groups: [UserValidationGroup.CREATION, UserValidationGroup.SIGN_IN] })
  @HasNoWhitespace({ groups: [UserValidationGroup.CREATION, UserValidationGroup.SIGN_IN] })
  @IsEmpty({ groups: [UserValidationGroup.UPDATE] })
  username!: string;

  @Column({ name: 'password', length: 72, select: false })
  @IsString({
    groups: [UserValidationGroup.CREATION, UserValidationGroup.SIGN_IN, UserValidationGroup.UPDATE],
  })
  @Length(8, 64, {
    groups: [UserValidationGroup.CREATION, UserValidationGroup.SIGN_IN, UserValidationGroup.UPDATE],
  })
  @IsOptional({ groups: [UserValidationGroup.UPDATE] })
  password!: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.STANDARD,
  })
  @IsEnum(UserRole, { groups: [UserValidationGroup.UPDATE] })
  @IsEmpty({ groups: [UserValidationGroup.CREATION] })
  @IsOptional({ groups: [UserValidationGroup.UPDATE] })
  role!: UserRole;

  @Column({ name: 'verified', default: false, select: false })
  @IsEmpty({ always: true })
  verified!: boolean;

  @Column({ name: 'name', type: 'varchar', length: 64, nullable: true, default: undefined })
  @IsString({ groups: [UserValidationGroup.CREATION, UserValidationGroup.UPDATE] })
  @Length(0, 64, { groups: [UserValidationGroup.CREATION, UserValidationGroup.UPDATE] })
  @IsOptional({ groups: [UserValidationGroup.CREATION, UserValidationGroup.UPDATE] })
  name?: string | null;

  @Column({ name: 'surname', type: 'varchar', length: 64, nullable: true, default: undefined })
  @IsString({ groups: [UserValidationGroup.CREATION, UserValidationGroup.UPDATE] })
  @Length(0, 64, { groups: [UserValidationGroup.CREATION, UserValidationGroup.UPDATE] })
  @IsOptional({ groups: [UserValidationGroup.CREATION, UserValidationGroup.UPDATE] })
  surname?: string | null;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: UserGender,
    default: UserGender.UNKNOWN,
  })
  @IsEnum(UserGender, { groups: [UserValidationGroup.CREATION, UserValidationGroup.UPDATE] })
  @IsOptional({ groups: [UserValidationGroup.CREATION, UserValidationGroup.UPDATE] })
  gender!: UserGender;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true, default: undefined })
  @IsISO8601(
    { strict: true },
    { groups: [UserValidationGroup.CREATION, UserValidationGroup.UPDATE] }
  )
  @IsOptional({ groups: [UserValidationGroup.CREATION, UserValidationGroup.UPDATE] })
  date_of_birth!: Date;

  @Column({ name: 'email', length: 128, unique: true, select: false, update: false })
  @IsEmail(undefined, { groups: [UserValidationGroup.CREATION] })
  @Length(3, 128, { groups: [UserValidationGroup.CREATION] })
  @IsEmpty({ groups: [UserValidationGroup.UPDATE] })
  email!: string;

  @Column({ name: 'phone', length: 15, unique: true, select: false, update: false })
  @IsMobilePhone(undefined, { strictMode: true }, { groups: [UserValidationGroup.CREATION] })
  @Length(8, 15, { groups: [UserValidationGroup.CREATION] })
  @IsEmpty({ groups: [UserValidationGroup.UPDATE] })
  phone!: string;

  @Column({ name: 'avatar', length: 256 })
  @IsEmpty({ always: true })
  avatar!: string;

  @OneToMany(() => Puppy, (puppy) => puppy.user)
  @IsEmpty({ always: true })
  puppies!: Puppy[];

  @OneToMany(() => UserFriend, (userFriend) => userFriend.user)
  @IsEmpty({ always: true })
  friends!: UserFriend[];

  @CreateDateColumn({ name: 'created_at', update: false })
  @IsEmpty({ always: true })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  @IsEmpty({ always: true })
  updated_at!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  toUndefinedIfEmpty() {
    if (typeof this.name === 'string' && isEmpty(this.name)) this.name = null;
    if (typeof this.surname === 'string' && isEmpty(this.surname)) this.surname = null;
  }

  @BeforeInsert()
  @BeforeUpdate()
  capitalizeName() {
    if (this.name) this.name = this.name.replace(/^\w/, (c) => c.toUpperCase());
  }

  @BeforeInsert()
  @BeforeUpdate()
  capitalizeSurname() {
    if (this.surname) this.surname = this.surname.replace(/^\w/, (c) => c.toUpperCase());
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) this.password = await CryptUtil.hash(this.password);
  }

  @BeforeInsert()
  defaultAvatar() {
    if (!this.gender) this.gender = UserGender.UNKNOWN;
    this.avatar = `https://res.cloudinary.com/dxiqa0xwa/image/upload/v1586709310/happypuppy/upload/user/avatar/${this.gender}.png`;
  }
}
