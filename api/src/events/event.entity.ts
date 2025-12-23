import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ebwise_id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  due_date: Date;

  @Column()
  course_name: string;

  @Column()
  course_id: number;

  @Column()
  module_type: string;

  @Column()
  event_type: string;

  @Column({ nullable: true })
  purpose: string;

  @Column()
  url: string;

  @Column({ default: false })
  overdue: boolean;

  @Column({ default: false })
  synced_to_calendar: boolean;

  @Column({ nullable: true })
  google_calendar_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}