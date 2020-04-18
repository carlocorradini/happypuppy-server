import { Entity, Index, Column, Check, PrimaryColumn } from 'typeorm';

@Entity('personality')
@Check(`"id" > 0`)
export default class Personality {
  @PrimaryColumn({ name: 'id' })
  @Index()
  id!: number;

  @Column({ name: 'name', length: 64, unique: true })
  name!: string;
}
