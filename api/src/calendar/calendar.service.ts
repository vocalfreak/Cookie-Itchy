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
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      prompt: 'consent',
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async syncEvents(accessToken: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

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
        const calendarEvent = {
          summary: `[${event.course_name}] ${event.title}`,
          description: event.description,
          start: {
            dateTime: event.due_date.toISOString(),
            timeZone: 'Asia/Kuala_Lumpur',
          },
          end: {
            dateTime: new Date(event.due_date.getTime() + 60 * 60 * 1000).toISOString(),
            timeZone: 'Asia/Kuala_Lumpur',
          },
          source: {
            title: 'Ebwise',
            url: event.url,
          },
          colorId: this.getEventColor(event.module_type),
        };

        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: calendarEvent,
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
        results.details.push({
          eventId: event.id,
          title: event.title,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return results;
  }

  async syncSingleEvent(eventId: number, accessToken: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.synced_to_calendar) {
      return {
        success: false,
        message: 'Event already synced',
        googleEventId: event.google_calendar_id,
      };
    }

    const calendarEvent = {
      summary: `[${event.course_name}] ${event.title}`,
      description: event.description,
      start: {
        dateTime: event.due_date.toISOString(),
        timeZone: 'Asia/Kuala_Lumpur',
      },
      end: {
        dateTime: new Date(event.due_date.getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: 'Asia/Kuala_Lumpur',
      },
      colorId: this.getEventColor(event.module_type),
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: calendarEvent,
    });

    await this.eventsRepository.update(event.id, {
      synced_to_calendar: true,
      google_calendar_id: response.data.id!,
    });

    return {
      success: true,
      googleEventId: response.data.id,
      event: response.data,
    };
  }

  private getEventColor(moduleType: string): string {
    const colorMap: Record<string, string> = {
      'assign': '11',    // Red
      'quiz': '5',       // Yellow
      'forum': '2',      // Green
      'resource': '9',   // Blue
      'feedback': '6',   // Orange
    };
    return colorMap[moduleType] || '1'; // Default lavender
  }
}