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
  MaxLength,
  IsEmail,
  IsEnum,
  Length,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import config from '@app/config';
import { CryptUtil } from '@app/utils';
import Puppy from './Puppy';

export enum UserValidationGroup {
  // eslint-disable-next-line no-unused-vars
  REGISTRATION = 'registration',
  // eslint-disable-next-line no-unused-vars
  UPDATE = 'update',
}

export enum UserGender {
  // eslint-disable-next-line no-unused-vars
  MALE = 'male',
  // eslint-disable-next-line no-unused-vars
  FEMALE = 'female',
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
  role!: UserRole;

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

  @Column({ name: 'gender', type: 'enum', enum: UserGender, update: false })
  @IsEnum(UserGender, { groups: [UserValidationGroup.REGISTRATION] })
  @IsNotEmpty({ groups: [UserValidationGroup.REGISTRATION] })
  @IsEmpty({ groups: [UserValidationGroup.UPDATE] })
  gender!: UserGender;

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
  @IsString({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @IsOptional({ groups: [UserValidationGroup.UPDATE] })
  @IsNotEmpty({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @Length(8, 64, { groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] }) // Clear password
  password!: string;

  //! !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @Column({ name: 'avatar', length: 128 })
  @IsString()
  @IsEmpty({ groups: [UserValidationGroup.REGISTRATION, UserValidationGroup.UPDATE] })
  @Length(1, 128)
  avatar!: string;

  // eslint-disable-next-line no-unused-vars
  @OneToMany((_type) => Puppy, (puppy) => puppy.user)
  puppies!: Promise<Puppy[]>;

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
  async defaultAvatar() {
    switch (this.gender) {
      case UserGender.MALE: {
        this.avatar = UserGender.MALE;
        break;
      }
      case UserGender.FEMALE: {
        this.avatar = UserGender.FEMALE;
        break;
      }
      default: {
        this.avatar = 'unknown';
        break;
      }
    }

    this.avatar += config.RESOURCE.IMAGE.EXT;
  }
}
