/* eslint-disable camelcase */
import { Entity, OneToOne, JoinColumn, Column, CreateDateColumn } from 'typeorm';
import { IsNumberString, Length, IsEmpty } from 'class-validator';
import config from '@app/config';
import User from './User';

@Entity('user_verification')
export default class UserVerification {
  @OneToOne(() => User, { primary: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @IsEmpty({ always: true })
  user!: User;

  @Column({ name: 'otp_email', length: config.SECURITY.OTP.EMAIL.DIGITS })
  @IsNumberString()
  @Length(config.SECURITY.OTP.EMAIL.DIGITS, config.SECURITY.OTP.EMAIL.DIGITS)
  otp_email!: string;

  @Column({ name: 'otp_phone', length: config.SECURITY.OTP.PHONE.DIGITS })
  @IsNumberString()
  @Length(config.SECURITY.OTP.PHONE.DIGITS, config.SECURITY.OTP.PHONE.DIGITS)
  otp_phone!: string;

  @CreateDateColumn({ name: 'created_at', select: false, update: false })
  created_at!: Date;
}
