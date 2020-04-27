/* eslint-disable camelcase */
import { Entity, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn, Column } from 'typeorm';
import { IsEmpty, IsUUID, IsEnum, IsOptional } from 'class-validator';
import User from './User';

export enum UserFriendValidationGroup {
  // eslint-disable-next-line no-unused-vars
  CREATION = 'creation',
  // eslint-disable-next-line no-unused-vars
  UPDATE = 'update',
}

export enum UserFriendType {
  // eslint-disable-next-line no-unused-vars
  FRIEND = 'friend',
  // eslint-disable-next-line no-unused-vars
  BLOCKED = 'blocked',
  // eslint-disable-next-line no-unused-vars
  FRIEND_REQUEST = 'friend_request',
  // eslint-disable-next-line no-unused-vars
  WAITING_ACCEPTANCE = 'waiting_acceptance',
  // eslint-disable-next-line no-unused-vars
  DELETED = 'deleted',
}

@Entity('user_friend')
export default class UserFriend {
  @ManyToOne(() => User, { primary: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @IsEmpty({ always: true })
  user!: User;

  @ManyToOne(() => User, (user) => user.friends, { primary: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'friend_id' })
  @IsUUID(undefined, {
    groups: [UserFriendValidationGroup.CREATION],
  })
  @IsEmpty({ groups: [UserFriendValidationGroup.UPDATE] })
  friend!: User;

  @Column({
    name: 'type',
    type: 'enum',
    enum: UserFriendType,
  })
  @IsEnum(UserFriendType, { groups: [UserFriendValidationGroup.UPDATE] })
  @IsEmpty({ groups: [UserFriendValidationGroup.CREATION] })
  @IsOptional({ groups: [UserFriendValidationGroup.UPDATE] })
  type!: UserFriendType;

  @CreateDateColumn({ name: 'created_at', update: false })
  @IsEmpty({ always: true })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  @IsEmpty({ always: true })
  updated_at!: Date;
}
