import { Entity, Index, Column, Check, PrimaryColumn } from 'typeorm';

@Entity('animal_personality')
@Check(`"id" > 0`)
export default class AnimalPersonality {
  @PrimaryColumn({ name: 'id' })
  @Index()
  id!: number;

  @Column({ name: 'name', length: 64, unique: true })
  name!: string;
}
