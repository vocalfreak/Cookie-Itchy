import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google } from 'googleapis';
import { Event } from '../events/event.entity';

@Injectable()
export class CalendarService {
  private oauth2Client;

  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/tasks'],
      prompt: 'consent',
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async syncTasks(accessToken: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const tasks = google.tasks({ version: 'v1', auth: this.oauth2Client });

    const events = await this.eventsRepository.find({
      where: { synced_to_calendar: false, overdue: false },
      order: { due_date: 'ASC' },
    });

    const results = {
      synced: 0,
      failed: 0,
      total: events.length,   
      details: [] as any[],
    };

    for (const event of events) {
      try {
        const task = {
          title: `${event.title}`,
          notes: `[${event.course_name}]\n\n ${event.description}\n\n ${event.url}`,
          due: event.due_date.toISOString(),
        };

        const response = await tasks.tasks.insert({
          tasklist: '@default',
          requestBody: task,
        });

        await this.eventsRepository.update(event.id, {
          synced_to_calendar: true,
          google_calendar_id: response.data.id!,
        });

        results.synced++;
        results.details.push({
          eventId: event.id,
          title: event.title,
          googleEventId: response.data.id,
          status: 'success',
        });
      } catch (error) {
        console.error(`Failed to sync event ${event.id}:`, error.message);
        results.failed++;
      }
    }

    return results;
  }

}