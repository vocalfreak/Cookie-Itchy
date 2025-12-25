import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const dataSource = app.get(DataSource);
    await dataSource.query('SELECT NOW()');
    console.log(' Database connected successfully');
    
    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type'],
    });
    
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(` API running on port ${port}`);
  } catch (error) {
    console.error(' Bootstrap failed:', error);
    process.exit(1);
  }
}

bootstrap();