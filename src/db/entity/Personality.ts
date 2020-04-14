import { Entity, PrimaryGeneratedColumn, Index, Column } from 'typeorm';

@Entity('personality')
export default class Personality {
  @PrimaryGeneratedColumn('increment')
  @Index()
  id!: number;

  @Column({ name: 'name', length: 64 })
  name!: string;
}
