import { Controller, Post, Get, Body } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('scrape')
  async receiveScrapedEvents(@Body() body: { events: any[] }) {
    const savedEvents = await this.eventsService.saveEvents(body.events);
    return {
      success: true,
      message: `Saved ${savedEvents.length} events`,
      events: savedEvents,
    };
  }

  @Get()
  async getAllEvents() {
    return this.eventsService.getAllEvents();
  }

  @Get('upcoming')
  async getUpcomingEvents() {
    return this.eventsService.getUpcomingEvents();
  }

  @Get('unsynced')
  async getUnsyncedEvents() {
    return this.eventsService.getUnsyncedEvents();
  }
}