import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async saveEventsBulk(eventsData: any[]): Promise<void> {
    const events = eventsData.map(eventData => {
      return this.eventsRepository.create({
        ebwise_id: eventData.id,
        title: eventData.activityname,
        description: eventData.description,
        due_date: new Date(eventData.timestart * 1000),
        course_name: eventData.course.fullname,
        course_id: eventData.course.id,
        module_type: eventData.modulename,
        event_type: eventData.eventtype,
        purpose: eventData.purpose,
        url: eventData.url,
        overdue: eventData.overdue,
      });
    });

    await this.eventsRepository.upsert(events, {
      conflictPaths: ['ebwise_id'],
      skipUpdateIfNoValuesChanged: true,
    });
  }

  async getAllEvents(): Promise<Event[]> {
    return this.eventsRepository.find({
      order: { due_date: 'ASC' },
    });
  }

  async getUpcomingEvents(): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { overdue: false },
      order: { due_date: 'ASC' },
    });
  }

  async getUnsyncedEvents(): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { synced_to_calendar: false, overdue: false },
      order: { due_date: 'ASC' },
    });
  }

  async markAsSynced(eventId: number, googleCalendarId: string): Promise<void> {
    await this.eventsRepository.update(eventId, {
      synced_to_calendar: true,
      google_calendar_id: googleCalendarId,
    });
  }
}