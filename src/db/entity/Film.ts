/* eslint-disable camelcase */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Check,
} from 'typeorm';
import { MinLength, MaxLength, IsString, IsInt, IsUrl, Min, Max, IsISO8601 } from 'class-validator';
// eslint-disable-next-line import/no-cycle
import Actor from './Actor';

@Entity({ name: 'film' })
@Check(`"rating" BETWEEN 1 AND 100`)
export default class Film {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  @Index()
  id!: number;

  @Column({ name: 'title', length: 256 })
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  title!: string;

  @Column({ name: 'rating', type: 'smallint' })
  @IsInt()
  @Min(1)
  @Max(100)
  rating!: number;

  @Column({ name: 'release_date', type: 'date' })
  @IsISO8601()
  release_date!: string;

  @Column({ name: 'poster', length: 256, unique: true })
  @IsUrl()
  poster!: string;

  @CreateDateColumn({ name: 'create_date', select: false, update: false })
  create_date!: Date;

  @UpdateDateColumn({ name: 'update_date', select: false })
  update_date!: Date;

  @ManyToMany(
    // eslint-disable-next-line no-unused-vars
    (type) => Actor,
    (actor) => actor.films,
    { primary: true, nullable: false }
  )
  @JoinTable({
    name: 'film_actor',
    joinColumn: {
      name: 'film_id',
    },
    inverseJoinColumn: {
      name: 'actor_id',
    },
  })
  actors!: Actor[];
}
