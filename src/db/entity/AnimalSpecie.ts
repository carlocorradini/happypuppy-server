import { Entity, Index, Column, OneToMany, PrimaryColumn, Check } from 'typeorm';
import Puppy from './Puppy';

@Entity('animal_specie')
@Check(`"id" > 0`)
export default class AnimalSpecie {
  @PrimaryColumn({ name: 'id' })
  @Index()
  id!: number;

  @Column({ name: 'name', length: 64, unique: true })
  name!: string;

  @OneToMany(() => Puppy, (puppy) => puppy.specie)
  puppies!: Puppy[];
}
