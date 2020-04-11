/* eslint-disable camelcase */
import { Entity, OneToOne, JoinColumn, Column, CreateDateColumn, RelationId } from 'typeorm';
import { IsNotEmpty, IsUUID, IsNumberString, Length } from 'class-validator';
import config from '@app/config';
import User from './User';

@Entity('user_verification')
export default class UserVerification {
  @OneToOne(() => User, { primary: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @RelationId((userVerification: UserVerification) => userVerification.user)
  @IsUUID()
  @IsNotEmpty()
  user_id!: string;

  @Column({ name: 'otp_email', length: config.SECURITY.OTP.EMAIL.DIGITS })
  @IsNumberString()
  @IsNotEmpty()
  @Length(config.SECURITY.OTP.EMAIL.DIGITS, config.SECURITY.OTP.EMAIL.DIGITS)
  otp_email!: string;

  @Column({ name: 'otp_phone', length: config.SECURITY.OTP.PHONE.DIGITS })
  @IsNumberString()
  @IsNotEmpty()
  @Length(config.SECURITY.OTP.PHONE.DIGITS, config.SECURITY.OTP.PHONE.DIGITS)
  otp_phone!: string;

  @CreateDateColumn({ name: 'created_at', select: false, update: false })
  created_at!: Date;
}
