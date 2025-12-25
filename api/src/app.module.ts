import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', 
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      logging: true, 
      autoLoadEntities: true,
    }),
    EventsModule,
  ],
})
export class AppModule {}