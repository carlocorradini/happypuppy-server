import { Entity, Index, Column, PrimaryColumn, Check, OneToMany } from 'typeorm';
import AnimalBreed from './AnimalBreed';

@Entity('animal_specie')
@Check(`"id" > 0`)
export default class AnimalSpecie {
  @PrimaryColumn({ name: 'id' })
  @Index()
  id!: number;

  @Column({ name: 'name', length: 64, unique: true })
  name!: string;

  @OneToMany(() => AnimalBreed, (breed) => breed.specie)
  breeds!: AnimalBreed[];
}
