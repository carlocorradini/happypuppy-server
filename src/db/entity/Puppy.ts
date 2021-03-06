/* eslint-disable camelcase */
import {
  Entity,
  PrimaryGeneratedColumn,
  Index,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  ManyToMany,
  JoinTable,
  Check,
  BeforeUpdate,
} from 'typeorm';
import {
  IsString,
  Length,
  IsEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsPositive,
  Min,
  Max,
  IsISO8601,
  IsArray,
  ArrayUnique,
} from 'class-validator';
import {
  IsValidAnimalSpecie,
  IsValidAnimalPersonalityArray,
  IsValidAnimalBreedArray,
  IsAnimalBreedArrayBelongToAnimalSpecie,
} from '@app/common/validator';
import User from './User';
import AnimalSpecie from './AnimalSpecie';
import AnimalBreed from './AnimalBreed';
import AnimalPersonality from './AnimalPersonality';

export enum PuppyValidationGroup {
  // eslint-disable-next-line no-unused-vars
  CREATION = 'creation',
  // eslint-disable-next-line no-unused-vars
  UPDATE = 'update',
}

export enum PuppyGender {
  // eslint-disable-next-line no-unused-vars
  MALE = 'male',
  // eslint-disable-next-line no-unused-vars
  FEMALE = 'female',
}

/**
 * Mininum puppy weight in grams
 */
export const PUPPY_MIN_WEIGHT: number = 0;
/**
 * Maximum puppy weight in grams
 * Weight of a Blue Whale
 */
export const PUPPY_MAX_WEIGHT: number = 190000000;

@Entity('puppy')
@Check(`weight >= ${PUPPY_MIN_WEIGHT} AND weight <= ${PUPPY_MAX_WEIGHT}`)
export default class Puppy {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  @Index()
  @IsEmpty({ always: true })
  id!: number;

  @Column({ name: 'name', length: 64 })
  @IsString({ groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] })
  @Length(1, 64, { groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] })
  @IsOptional({ groups: [PuppyValidationGroup.UPDATE] })
  name!: string;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: PuppyGender,
    update: false,
  })
  @IsEnum(PuppyGender, { groups: [PuppyValidationGroup.CREATION] })
  @IsEmpty({ groups: [PuppyValidationGroup.UPDATE] })
  gender!: PuppyGender;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true, default: undefined })
  @IsISO8601(
    { strict: true },
    { groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] }
  )
  @IsOptional({ groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] })
  date_of_birth!: Date;

  @Column({ name: 'weight', type: 'integer', nullable: true, default: undefined })
  @IsInt({ groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] })
  @Min(PUPPY_MIN_WEIGHT, {
    groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE],
  })
  @Max(PUPPY_MAX_WEIGHT, {
    groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE],
  })
  @IsOptional({ groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] })
  weight?: number | null;

  @Column({ name: 'avatar', length: 256 })
  @IsEmpty({ always: true })
  avatar!: string;

  @ManyToOne(() => User, (user) => user.puppies, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @IsEmpty({ always: true })
  user!: User;

  @ManyToOne(() => AnimalSpecie, undefined, { nullable: false })
  @JoinColumn({ name: 'specie_id' })
  @IsInt({ groups: [PuppyValidationGroup.CREATION] })
  @IsPositive({ groups: [PuppyValidationGroup.CREATION] })
  @IsValidAnimalSpecie({ groups: [PuppyValidationGroup.CREATION] })
  @IsEmpty({ groups: [PuppyValidationGroup.UPDATE] })
  specie!: AnimalSpecie;

  @ManyToMany(() => AnimalBreed)
  @JoinTable({
    name: 'puppy_animal_breed',
    joinColumn: {
      name: 'puppy_id',
    },
    inverseJoinColumn: {
      name: 'breed_id',
    },
  })
  @IsArray({ groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] })
  @ArrayUnique({ groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] })
  @IsInt({ each: true, groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] })
  @IsPositive({ each: true, groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] })
  @IsValidAnimalBreedArray({ groups: [PuppyValidationGroup.CREATION] })
  @IsAnimalBreedArrayBelongToAnimalSpecie({ groups: [PuppyValidationGroup.CREATION] })
  @IsOptional({ groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] })
  breeds!: AnimalBreed[];

  @ManyToMany(() => AnimalPersonality)
  @JoinTable({
    name: 'puppy_animal_personality',
    joinColumn: {
      name: 'puppy_id',
    },
    inverseJoinColumn: {
      name: 'personality_id',
    },
  })
  @IsArray({ groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] })
  @ArrayUnique({ groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] })
  @IsInt({ each: true, groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] })
  @IsPositive({
    each: true,
    groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE],
  })
  @IsValidAnimalPersonalityArray({
    groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE],
  })
  @IsOptional({ groups: [PuppyValidationGroup.CREATION, PuppyValidationGroup.UPDATE] })
  personalities!: AnimalPersonality[];

  @CreateDateColumn({ name: 'created_at', update: false })
  @IsEmpty({ always: true })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  @IsEmpty({ always: true })
  updated_at!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  toUndefinedIfEmpty() {
    if (typeof this.weight === 'number' && this.weight === 0) this.weight = 0;
  }

  @BeforeInsert()
  defaultAvatar() {
    this.avatar = `https://res.cloudinary.com/dxiqa0xwa/image/upload/v1586709310/happypuppy/upload/puppy/avatar/${
      !this.breeds || this.breeds.length === 0
        ? this.specie.name.toLowerCase()
        : `${this.specie.name}_${this.breeds[0].name.replace(/ /g, '_')}`.toLowerCase()
    }.png`;
  }
}
