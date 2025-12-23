import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],  
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService], 
})
export class EventsModule {}