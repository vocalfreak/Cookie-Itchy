import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, 
      ssl: {
        rejectUnauthorized: false
      },
      logging: ['error', 'warn'], 
      autoLoadEntities: true,
    }),
    EventsModule,
  ],
})
export class AppModule {}