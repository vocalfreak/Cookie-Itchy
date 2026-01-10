import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { Event } from '../events/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}