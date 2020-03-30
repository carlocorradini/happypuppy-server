/* eslint-disable camelcase */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
  ManyToMany,
} from 'typeorm';
import {
  MinLength,
  MaxLength,
  IsString,
  IsUrl,
  IsIn,
  IsISO8601,
  IsOptional,
} from 'class-validator';
// eslint-disable-next-line import/no-cycle
import Film from './Film';

@Entity({ name: 'actor' })
@Check(`"gender" = 'M' OR "gender" = 'F'`)
export default class Actor {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  @Index()
  id!: number;

  @Column({ name: 'name', length: 64 })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name!: string;

  @Column({ name: 'surname', length: 64 })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  surname!: string;

  @Column({ name: 'gender', type: 'character' })
  @IsString()
  @IsIn(['M', 'F'])
  gender!: string;

  @Column({ name: 'birth_date', type: 'date', update: false })
  @IsISO8601()
  birth_date!: string;

  @Column({ name: 'death_date', type: 'date', nullable: true })
  @IsOptional()
  @IsISO8601({ always: false })
  death_date!: string;

  @Column({ name: 'profile', length: 256 })
  @IsUrl()
  profile!: string;

  @CreateDateColumn({ name: 'create_date', select: false, update: false })
  create_date!: Date;

  @UpdateDateColumn({ name: 'update_date', select: false })
  update_date!: Date;

  @ManyToMany(
    // eslint-disable-next-line no-unused-vars
    (type) => Film,
    (film) => film.actors,
    {
      primary: true,
      nullable: false,
    }
  )
  films!: Film[];
}
