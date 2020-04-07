/* eslint-disable camelcase */
import { Entity, OneToOne, JoinColumn, Column, CreateDateColumn, RelationId, Check } from 'typeorm';
import { IsNotEmpty, IsInt, IsPositive, IsUUID, Min, Max } from 'class-validator';
import config from '@app/config';
import User from './User';

@Entity('user_verification')
@Check(`email_code >= 0 AND email_code <= ${10 ** config.SECURITY.VERIFICATION.EMAIL.DIGITS - 1}`)
@Check(`phone_code >= 0 AND phone_code <= ${10 ** config.SECURITY.VERIFICATION.PHONE.DIGITS - 1}`)
export default class UserVerification {
  // TODO type???
  // eslint-disable-next-line no-unused-vars
  @OneToOne((_type) => User, { primary: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @RelationId((userVerification: UserVerification) => userVerification.user)
  @IsUUID()
  @IsNotEmpty()
  user_id!: string;

  // TODO Max Length & Min length
  @Column({ name: 'email_code', type: 'integer' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  @Min(0)
  @Max(10 ** config.SECURITY.VERIFICATION.EMAIL.DIGITS - 1)
  email_code!: number;

  // TODO Max Length & Min length
  @Column({ name: 'phone_code', type: 'integer' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  @Min(0)
  @Max(10 ** config.SECURITY.VERIFICATION.PHONE.DIGITS - 1)
  phone_code!: number;

  @CreateDateColumn({ name: 'created_at', select: false, update: false })
  created_at!: Date;
}
