import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL 
        ? { 
            url: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
          }
        : { 
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT ?? '5432', 10),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'ebwise_dev',
          }
      ),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: ['error', 'warn'],
      autoLoadEntities: true,
    }),
    EventsModule,
    CalendarModule,
  ],
})
export class AppModule {}