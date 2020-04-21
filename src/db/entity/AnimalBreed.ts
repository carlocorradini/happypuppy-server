import { Entity, Index, Column, PrimaryColumn, Check, ManyToOne, JoinColumn } from 'typeorm';
import AnimalSpecie from './AnimalSpecie';

@Entity('animal_breed')
@Check(`"id" > 0`)
export default class AnimalBreed {
  @PrimaryColumn({ name: 'id' })
  @Index()
  id!: number;

  @Column({ name: 'name', length: 64, unique: true })
  name!: string;

  @ManyToOne(() => AnimalSpecie, (specie) => specie.breeds, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'specie_id' })
  specie!: AnimalSpecie;
}
