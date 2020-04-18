import { Entity, Index, Column, PrimaryColumn, Check } from 'typeorm';

@Entity('animal_specie')
@Check(`"id" > 0`)
export default class AnimalSpecie {
  @PrimaryColumn({ name: 'id' })
  @Index()
  id!: number;

  @Column({ name: 'name', length: 64, unique: true })
  name!: string;
}
