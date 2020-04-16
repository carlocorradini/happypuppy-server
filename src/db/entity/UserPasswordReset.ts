/* eslint-disable camelcase */
import { Entity, OneToOne, JoinColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import config from '@app/config';
import User from './User';

@Entity('user_password_reset')
export default class UserPasswordReset {
  @OneToOne(() => User, { primary: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'token', length: config.SECURITY.TOKEN.PASSWORD.LENGTH })
  token!: string;

  @CreateDateColumn({ name: 'created_at', select: false, update: false })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updated_at!: Date;
}
